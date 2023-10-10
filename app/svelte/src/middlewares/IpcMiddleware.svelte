<script lang="ts">
	import type { SongType } from '../../../types/song.type'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import registerMediaKeysFn from '../functions/registerMediaKeys.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import updateConfigFn from '../functions/updateConfig.fn'
	import handleArtService from '../services/handleArt.service'
	import mediaKeyControlsService from '../services/mediaKeyControls.service'
	import { configStore, playbackShuffleConfig, songSortConfig } from '../stores/config.store'
	import { onNewLyrics } from '../stores/crosscall.store'
	import {
		artCompressQueueLength,
		dbVersionStore,
		layoutToShow,
		playbackStore,
		playingSongStore,
		setSelectedAlbumsDir,
		songSyncQueueProgress
	} from '../stores/main.store'

	import type { DatabaseResponseType } from '../../../types/databaseWorkerMessage.type'
	import getRandomNumberBetweenTwoValuesFn from '../functions/getRandomNumberBetweenTwoValues.fn'
	import updatePlayCountFn from '../functions/updatePlayCount.fn'

	window.ipc.onDatabaseUpdate((_, response) => {
		dbVersionStore.set(response)
	})

	window.ipc.handleNewImageArt((_, data) => {
		handleArtService.handleNewImageArt(data)
	})

	window.ipc.handleNewVideoArt((_, data) => {
		handleArtService.handleNewVideoArt(data)
	})

	window.ipc.handleNewAnimationArt((_, data) => {
		handleArtService.handleNewAnimationArt(data)
	})

	window.ipc.songSyncQueueProgress((_, data) => {
		$songSyncQueueProgress = data
	})

	window.ipc.onArtQueueChange((_, artQueueLength) => {
		$artCompressQueueLength = artQueueLength
	})

	window.ipc.onShowLyrics((_, data) => {
		$layoutToShow = 'Lyrics'

		$onNewLyrics = {
			artist: data.artist,
			title: data.title
		}
	})

	window.ipc.onSelectedDirectories((_, data) => {
		$configStore.directories = {
			add: data.add,
			exclude: data.exclude
		}
	})

	window.ipc.onAlbumPlayNow(async (_, data: { songList: SongType[]; clickedAlbum: string; selectedAlbumsDir: string[] }) => {
		// If the album clicked is not included in the list of selected albums, only add the clicked album to the list.
		if (!data.selectedAlbumsDir.includes(data.clickedAlbum)) {
			let bulkReadResponse: DatabaseResponseType = await window.ipc.bulkRead({
				queryData: {
					select: ['*'],
					andWhere: [
						{
							Directory: data.clickedAlbum
						}
					],
					order: [`${$songSortConfig.sortBy} ${$songSortConfig.sortOrder}`]
				}
			})

			let songs = bulkReadResponse.results.data

			setNewPlaybackFn(data.clickedAlbum, songs, undefined, { playNow: true }, { shuffle: $playbackShuffleConfig })

			setSelectedAlbumsDir([data.clickedAlbum])
			// $selectedAlbumsDir = [data.clickedAlbum]
		} else {
			setNewPlaybackFn(
				getDirectoryFn(data.songList[0].SourceFile),
				data.songList,
				$playbackShuffleConfig === true
					? data.songList[getRandomNumberBetweenTwoValuesFn(0, data.songList.length - 1)].ID
					: data.songList[0].ID,
				{ playNow: true },
				{ shuffle: $playbackShuffleConfig }
			)
		}
	})

	window.ipc.onAlbumAddToPlayback(
		async (_, data: { songList: SongType[]; clickedAlbum: string; selectedAlbumsDir: string[]; keyModifier }) => {
			let songListToAdd: SongType[] = []
			// If the album clicked is not included in the list of selected albums, only add the clicked album to the list.
			if (!data.selectedAlbumsDir.includes(data.clickedAlbum)) {
				let bulkReadResponse: DatabaseResponseType = await window.ipc.bulkRead({
					queryData: {
						select: ['*'],
						andWhere: [
							{
								Directory: data.clickedAlbum
							}
						],
						order: [`${$songSortConfig.sortBy} ${$songSortConfig.sortOrder}`]
					}
				})

				songListToAdd = bulkReadResponse.results.data
			} else {
				songListToAdd = data.songList
			}

			songListToAdd.forEach(song => {
				let foundSong = $playbackStore.find(item => item.ID === song.ID)

				if (!foundSong || data.keyModifier === 'altKey') {
					$playbackStore.push(song)
					$playbackStore = $playbackStore
				}
			})
		}
	)

	window.ipc.onAlbumPlayAfter(
		(_, data: { songs: SongType[]; clickedAlbum: string; selectedAlbumsDir: string[]; keyModifier }) => {
			let currentPlayingSongIndex = $playbackStore.findIndex(song => song.ID === $playingSongStore.ID) + 1 || 0
			let arrayCopy = [...$playbackStore]
			arrayCopy.splice(currentPlayingSongIndex, 0, ...data.songs)
			$playbackStore = arrayCopy
		}
	)

	window.ipc.onSongAddToPlayback(async (_, data: { songsToAddToPlayback: SongType[] }) => {
		$playbackStore = [...$playbackStore, ...data.songsToAddToPlayback]
	})

	window.ipc.onSongPlayAfter(async (_, data) => {
		let selectedSongs = data.selectedSongs
		let clickedSong = data.clickedSong
		let allSongs = []

		if (selectedSongs.findIndex(song => song.ID === clickedSong.ID) === -1) {
			allSongs = [clickedSong]
		} else {
			allSongs = sortSongsArrayFn(selectedSongs, $songSortConfig.sortBy, $songSortConfig.sortOrder, $configStore.group)
		}

		let currentPlayingSongIndex = $playbackStore.findIndex(song => song.ID === $playingSongStore.ID) + 1 || 0

		let arrayCopy = [...$playbackStore]

		arrayCopy.splice(currentPlayingSongIndex, 0, ...allSongs)

		$playbackStore = arrayCopy
	})

	window.ipc.onSongPlayNow(async (_, data) => {
		let selectedSongs: SongType[] = data.selectedSongs
		let clickedSong: SongType = data.clickedSong
		let allSongs: SongType[] = []

		if (selectedSongs.findIndex(song => song.ID === clickedSong.ID) === -1) {
			allSongs = [clickedSong]
		} else {
			allSongs = sortSongsArrayFn(selectedSongs, $songSortConfig.sortBy, $songSortConfig.sortOrder, $configStore.group)
		}

		setNewPlaybackFn(allSongs[0].Directory, allSongs, undefined, { playNow: true }, { shuffle: $playbackShuffleConfig })
	})

	window.ipc.onChangeSongAmount((_, data) => {
		updateConfigFn({
			userOptions: {
				songAmount: data
			}
		})
	})

	window.ipc.onGroupSelected((_, data) => {
		updateConfigFn({
			group: {
				groupBy: data.groupName
			}
		})
	})

	window.ipc.onSortsongs((_, data) => {
		updateConfigFn({
			userOptions: {
				songSort: {
					sortBy: data.tag,
					sortOrder: data.order
				}
			}
		})
	})

	// Global shortcuts
	window.ipc.onMediaKeyPressed((_, mediaKeyPressed) => {
		if (mediaKeyPressed === 'MediaNextTrack') {
			mediaKeyControlsService.nextMedia()
		} else if (mediaKeyPressed === 'MediaPreviousTrack') {
			mediaKeyControlsService.previousMedia()
		} else if (mediaKeyPressed === 'MediaPreviousTrackForce') {
			mediaKeyControlsService.previousMedia()
		} else if (mediaKeyPressed === 'MediaPlayPause') {
			mediaKeyControlsService.togglePlayPauseMedia()
		}
	})

	window.ipc.onGlobalShortcutsRegistered((_, globalShortcutsRegistered) => {
		if (globalShortcutsRegistered === false) {
			registerMediaKeysFn()
		}
	})

	window.ipc.onResetSongPlayCount((_, songs) => {
		songs.forEach(song => {
			updatePlayCountFn(song.ID, 'reset')
		})
	})
</script>
