<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType } from '../../../types/song.type'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'
	import applyColorSchemeFn from '../functions/applyColorScheme.fn'
	import getAlbumColorsFn from '../functions/getAlbumColors.fn'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'

	import { playbackStore, selectedAlbumDir, selectedAlbumsDir, songListStore } from '../stores/main.store'
	import { config } from '../stores/main.store'

	let allSongs = []

	$: fillSongList($selectedAlbumsDir)

	$: {
		$songListStore = allSongs
	}

	$: {
		if ($selectedAlbumsDir !== undefined) {
			localStorage.setItem('SelectedAlbumsDir', JSON.stringify($selectedAlbumsDir))
		}
	}

	$: {
		if ($songListStore !== undefined && $songListStore.length > 0) {
			localStorage.setItem('SongList', JSON.stringify($songListStore))
		}
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
		// let lastPlayedDir = localStorage.getItem('LastPlayedDir')
		// let lastPlayedDirs = JSON.parse(localStorage.getItem('SelectedAlbumsDir'))
		let songList: SongType[] = JSON.parse(localStorage.getItem('SongList'))

		let lastPlayedSong = songList.find(song => song.ID === lastPlayedSongId)

		setNewPlaybackFn(getDirectoryFn(lastPlayedSong.SourceFile), songList, lastPlayedSongId, {
			playNow: false
		})

		$playbackStore = songList

		songList.forEach(song => {
			let songDirectory = getDirectoryFn(song.SourceFile)

			if (!$selectedAlbumsDir.includes(songDirectory)) {
				$selectedAlbumsDir.push(songDirectory)
				$selectedAlbumsDir = $selectedAlbumsDir
			}
		})

		$songListStore = songList

		/* 		getAlbumSongsFn(lastPlayedDir).then(songs => {
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
		}) */
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
