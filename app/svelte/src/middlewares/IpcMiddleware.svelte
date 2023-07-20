<script lang="ts">
	import type { SongType } from '../../../types/song.type'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import registerMediaKeysFn from '../functions/registerMediaKeys.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import updateConfigFn from '../functions/updateConfig.fn'
	import handleArtService from '../services/handleArt.service'
	import mediaKeyControlsService from '../services/mediaKeyControls.service'
	import { config, songAmountConfig } from '../stores/config.store'
	import { onNewLyrics } from '../stores/crosscall.store'
	import {
		artCompressQueueLength,
		dbVersionStore,
		layoutToShow,
		playbackStore,
		playingSongStore,
		selectedAlbumsDir,
		songSyncQueueProgress
	} from '../stores/main.store'

	import type { DatabaseResponseType } from '../../../types/databaseWorkerMessage.type'

	$: if ($playbackStore.length > 0) {
	}

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
		$config.directories = {
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
					order: [`${$config.userOptions.sortBy} ${$config.userOptions.sortOrder}`]
				}
			})

			let songs = bulkReadResponse.results.data

			setNewPlaybackFn(data.clickedAlbum, songs, undefined, { playNow: true })

			$selectedAlbumsDir = [data.clickedAlbum]
		} else {
			setNewPlaybackFn(getDirectoryFn(data.songList[0].SourceFile), data.songList, data.songList[0].ID, { playNow: true })
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
						order: [`${$config.userOptions.sortBy} ${$config.userOptions.sortOrder}`]
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

		if (selectedSongs.findIndex(song => song.ID === clickedSong.ID) === -1) {
			selectedSongs.push(clickedSong)
		}

		let sortedSongs = sortSongsArrayFn(selectedSongs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		let currentPlayingSongIndex = $playbackStore.findIndex(song => song.ID === $playingSongStore.ID) + 1 || 0

		let arrayCopy = [...$playbackStore]

		arrayCopy.splice(currentPlayingSongIndex, 0, ...sortedSongs)

		$playbackStore = arrayCopy
	})

	window.ipc.onChangeSongAmount((_, data) => {
		updateConfigFn({
			userOptions: {
				songAmount: data
			}
		})
	})

	// Global shortcuts
	window.ipc.onMediaKeyPressed((_, mediaKeyPressed) => {
		if (mediaKeyPressed === 'MediaNextTrack') {
			mediaKeyControlsService.nextMedia()
		} else if (mediaKeyPressed === 'MediaPreviousTrack') {
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
</script>
