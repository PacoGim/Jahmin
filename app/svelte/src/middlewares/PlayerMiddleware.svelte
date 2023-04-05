<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType } from '../../../types/song.type'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { config } from '../stores/config.store'

	import {
		playbackStore,
		selectedAlbumDir,
		selectedAlbumsDir,
		songListStore,
		triggerScrollToSongEvent
	} from '../stores/main.store'

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
		let songList: SongType[] = JSON.parse(localStorage.getItem('SongList'))

		if (songList.length === 0) {
			return
		}

		let lastPlayedSong = songList.find(song => song.ID === lastPlayedSongId)
		let lastPlayedSongDirectory = getDirectoryFn(lastPlayedSong.SourceFile)

		$songListStore = songList
		$playbackStore = songList

		setNewPlaybackFn(lastPlayedSongDirectory, songList, lastPlayedSongId, {
			playNow: false
		})

		songList.forEach(song => {
			let songDirectory = getDirectoryFn(song.SourceFile)

			if (!$selectedAlbumsDir.includes(songDirectory)) {
				$selectedAlbumsDir.push(songDirectory)
				$selectedAlbumsDir = $selectedAlbumsDir
			}
		})

		scrollToAlbumFn(lastPlayedSongDirectory, 'smooth-scroll')
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
