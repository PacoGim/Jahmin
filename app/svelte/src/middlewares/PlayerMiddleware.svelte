<script lang="ts">
	import { onMount } from 'svelte'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'
	import applyColorSchemeFn from '../functions/applyColorScheme.fn'
	import getAlbumColorsFn from '../functions/getAlbumColors.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	// import { getAlbumIPC, getAlbumsIPC } from '../services/ipc.service'
	// import { sortByConfig, sortOrderConfig } from '../store/config.store'

	import { dbVersionStore, playbackStore, selectedAlbumDir, songListStore } from '../stores/main.store'
	import { config } from '../stores/main.store'

	$: {
		$dbVersionStore
		updateSongListStore()
	}

	async function updateSongListStore() {
		// let songs = await getAlbumSongsFn($selectedAlbumDir)
		// let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		// if ($songListStore.length !== sortedSongs.length || songs.length !== sortedSongs.length) {
		// 	$songListStore = sortedSongs
		// }
	}

	/* 	$: {
		if (firstGroupByAssign === true) {
			firstGroupByAssign = false
		} else {
			getAlbums($selectedGroupByStore, $selectedGroupByValueStore)
		}
	} */

	// function getAlbums(groupBy: string, groupByValue: string) {
	// 	getAlbumsIPC(groupBy, groupByValue).then(result => ($albumListStore = result))
	// }

	function loadPreviousState() {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))
		let lastPlayedDir = localStorage.getItem('LastPlayedDir')

		getAlbumSongsFn(lastPlayedDir).then(songs => {
			if (songs.length === 0) {
				$selectedAlbumDir = undefined
				getAlbumColorsFn(undefined).then(color => {
					applyColorSchemeFn(color)
				})
				return
			} else {
				$selectedAlbumDir = lastPlayedDir
			}

			$songListStore = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

			setNewPlaybackFn(lastPlayedDir, $songListStore, lastPlayedSongId, { playNow: false })

			scrollToAlbumFn(lastPlayedDir, 'smooth-scroll')
		})
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
