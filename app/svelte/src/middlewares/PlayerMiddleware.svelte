<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType } from '../../../types/song.type'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import { dbVersionStore, playbackStore, selectedAlbumsDir, songListStore } from '../stores/main.store'

	let allSongs = []

	$: fillSongList($selectedAlbumsDir)
	$: $dbVersionStore !== 0 ? fillSongList($selectedAlbumsDir) : null

	$: $songListStore = allSongs

	$: {
		if ($selectedAlbumsDir !== undefined) {
			localStorage.setItem('SelectedAlbumsDir', JSON.stringify($selectedAlbumsDir))
		}
	}

	function fillSongList(albumRootDirList: string[] = []) {
		if (albumRootDirList.length === 0) {
			allSongs = []
			return
		}

		let whereQuery = albumRootDirList.map(rootDir => {
			return { Directory: rootDir }
		})

		window.ipc
			.bulkRead({
				queryData: {
					select: ['*'],
					orWhere: whereQuery,
					order: ['Album', 'Track'] //TODO add the proper sorting here and in art grid
				}
			})
			.then(response => {
				if (JSON.stringify(allSongs) !== JSON.stringify(response.results.data)) {
					allSongs = []
					allSongs = [...allSongs, ...response.results.data]
				}
			})
	}

	function loadPreviousState() {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))
		let songList: SongType[] = JSON.parse(localStorage.getItem('SongList'))

		if (songList === null || songList.length === 0) {
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
