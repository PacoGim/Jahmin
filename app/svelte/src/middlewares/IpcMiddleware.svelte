<script lang="ts">
	import { addTaskToQueue } from '../db/!db'
	import bulkDeleteSongsFn from '../db/bulkDeleteSongs.fn'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import handleArtService from '../services/handleArt.service'
	import { onNewLyrics } from '../stores/crosscall.store'
	import { artCompressQueueLength, config, layoutToShow, songSyncQueueProgress } from '../stores/main.store'

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
</script>
