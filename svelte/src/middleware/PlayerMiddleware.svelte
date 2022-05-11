<script lang="ts">
	import { onMount } from 'svelte'
	import { getAlbumSongs } from '../db/db'
	import applyColorSchemeFn from '../functions/applyColorScheme.fn'
	// import { getAlbumSongs } from '../db/db'
	import { getAlbumColors } from '../functions/getAlbumColors.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { getAlbumIPC, getAlbumsIPC } from '../services/ipc.service'
	import { sortByConfig, sortOrderConfig } from '../store/config.store'

	import {
		albumListStore,
		dbSongsStore,
		dbVersionStore,
		selectedAlbumDir,
		selectedAlbumId,
		selectedGroupByStore,
		selectedGroupByValueStore,
		songListStore,
		triggerScrollToSongEvent
	} from '../store/final.store'

	let firstGroupByAssign = true
	let firstDbVersionAssign = true

	$: {
		if (firstGroupByAssign === true) {
			firstGroupByAssign = false
		} else {
			getAlbums($selectedGroupByStore, $selectedGroupByValueStore)
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then(result => ($albumListStore = result))
	}

	function loadPreviousState() {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))
		let lastPlayedDir = localStorage.getItem('LastPlayedDir')

		getAlbumSongs(lastPlayedDir).then(songs => {
			if (songs.length === 0) {
				$selectedAlbumDir = undefined
				getAlbumColors(undefined).then(color => {
					applyColorSchemeFn(color)
				})
				return
			} else {
				$selectedAlbumDir = lastPlayedDir
			}

			$songListStore = sortSongsArrayFn(songs, $sortByConfig, $sortOrderConfig)

			setNewPlayback(lastPlayedDir, $songListStore, lastPlayedSongId, false)

			scrollToAlbumFn(lastPlayedDir, 'smooth-scroll')

			$triggerScrollToSongEvent = lastPlayedSongId
		})
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
