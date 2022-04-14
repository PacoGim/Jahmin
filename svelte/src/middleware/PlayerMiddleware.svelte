<script lang="ts">
	import { onMount } from 'svelte'
	import { getAlbumSongs } from '../db/db'
	import { getAlbumColors } from '../functions/getAlbumColors.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumIPC, getAlbumsIPC } from '../services/ipc.service'

	import {
		albumListStore,
		dbVersionStore,
		selectedAlbumDir,
		selectedAlbumId,
		selectedGroupByStore,
		selectedGroupByValueStore,
		songListStore
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

		getAlbumColors(lastPlayedDir)

		$selectedAlbumDir = lastPlayedDir

		getAlbumSongs(lastPlayedDir).then(songs => {
			$songListStore = songs

			setNewPlayback(lastPlayedDir, $songListStore, lastPlayedSongId, false)
		})
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
