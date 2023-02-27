<script lang="ts">
	import { all } from 'deepmerge'
	import { onMount } from 'svelte'
	import Album from '../components/Album.svelte'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'
	import applyColorSchemeFn from '../functions/applyColorScheme.fn'
	import getAlbumColorsFn from '../functions/getAlbumColors.fn'
	import groupSongsByAlbumFn from '../functions/groupSongsByAlbum.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'

	import { selectedAlbumDir, selectedAlbumsDir, songListStore } from '../stores/main.store'
	import { config } from '../stores/main.store'

	let allSongs = []

	$: fillSongList($selectedAlbumsDir)

	$: {
		$songListStore = allSongs
	}

	function fillSongList(albumRootDirList: string[] = []) {
		allSongs = []
		albumRootDirList.forEach(albumRootDir => {
			getAlbumSongsFn(albumRootDir).then(songs => {
				let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

				allSongs = [...allSongs, ...sortedSongs]
			})
		})
	}

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
				$selectedAlbumsDir = [lastPlayedDir]
				$selectedAlbumDir = lastPlayedDir
			}

			// $songListStore = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)
			let fooSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

			setNewPlaybackFn(lastPlayedDir, fooSongs, lastPlayedSongId, { playNow: false })
			// setNewPlaybackFn(lastPlayedDir, $songListStore, lastPlayedSongId, { playNow: false })

			scrollToAlbumFn(lastPlayedDir, 'smooth-scroll')
		})
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
