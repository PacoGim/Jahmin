<script lang="ts">
	import type { SongType } from '../../../types/song.type'
	import { addTaskToQueue } from '../db/!db'
	import bulkDeleteSongsFn from '../db/bulkDeleteSongs.fn'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import handleArtService from '../services/handleArt.service'
	import { onNewLyrics } from '../stores/crosscall.store'
	import {
		artCompressQueueLength,
		config,
		layoutToShow,
		playbackStore,
		playingSongStore,
		selectedAlbumsDir,
		songSyncQueueProgress
	} from '../stores/main.store'

	window.ipc.onGetAllSongsFromRenderer(() => {
		getAllSongsFn().then(songs => {
			window.ipc.sendAllSongsToMain(songs)
		})
	})

	window.ipc.handleWebStorage((_, response) => {
		addTaskToQueue(response.data, response.type)
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

	window.ipc.onWebStorageBulkDelete((_, songsToDelete) => {
		bulkDeleteSongsFn(songsToDelete)
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
		if (!data.selectedAlbumsDir.includes(data.clickedAlbum)) {
			let songs = await getAlbumSongsFn(data.clickedAlbum)

			let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)
			setNewPlaybackFn(data.clickedAlbum, sortedSongs, undefined, { playNow: true })
			$selectedAlbumsDir = [data.clickedAlbum]
		} else {
			setNewPlaybackFn(getDirectoryFn(data.songList[0].SourceFile), data.songList, data.songList[0].ID, { playNow: true })
		}
	})

	window.ipc.onAlbumAddToPlayback(async (_, rootDir) => {
		let songs = await getAlbumSongsFn(rootDir)

		let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		$playbackStore.push(...sortedSongs)
	})

	window.ipc.onAlbumPlayAfter(async (_, rootDir) => {
		let songs = await getAlbumSongsFn(rootDir)

		let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		let currentPlayingSongIndex = $playbackStore.findIndex(song => song.ID === $playingSongStore.ID) + 1 || 0

		let arrayCopy = [...$playbackStore]

		arrayCopy.splice(currentPlayingSongIndex, 0, ...sortedSongs)

		$playbackStore = arrayCopy
	})

	window.ipc.onSongAddToPlayback(async (_, data) => {
		let selectedSongs = data.selectedSongs
		let clickedSong = data.clickedSong

		if (selectedSongs.findIndex(song => song.ID === clickedSong.ID) === -1) {
			selectedSongs.push(clickedSong)
		}

		let sortedSongs = sortSongsArrayFn(selectedSongs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		$playbackStore.push(...sortedSongs)
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
</script>
