<script lang="ts">
	import { onMount } from 'svelte'
	import { getAlbumColors } from '../functions/getAlbumColors.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumIPC, getAlbumsIPC } from '../services/ipc.service'

	import {
		albumListStore,
		dbVersion,
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

	$: {
		$dbVersion
		if (firstDbVersionAssign === true) {
			firstDbVersionAssign = false
		} else {
			syncDBSongs()
		}
	}

	function syncDBSongs() {
		if ($dbVersion !== '') {
			// getAlbums($selectedGroupByStore, $selectedGroupByValueStore)

			// Refills the current album selected songs to add them as they are found.
			getAlbumIPC($selectedAlbumId).then(result => {
				if (result.Songs.length !== $songListStore.length) {
					console.log('Getting songs')
					$songListStore = result.Songs
				}
			})
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then(result => ($albumListStore = result))
	}

	function loadPreviousState() {
		let lastPlayedAlbumId = localStorage.getItem('LastPlayedAlbumId')
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		getAlbumColors(lastPlayedAlbumId)

		$selectedAlbumId = lastPlayedAlbumId

		getAlbumIPC(lastPlayedAlbumId).then(result => {
			$songListStore = result.Songs

			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongId, false)
			// setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongId, true)
		})
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
