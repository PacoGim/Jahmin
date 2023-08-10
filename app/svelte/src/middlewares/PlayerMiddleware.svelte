<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType } from '../../../types/song.type'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import { dbVersionStore, playbackStore, selectedAlbumsDir, setSelectedAlbumsDir, songListStore } from '../stores/main.store'
	import { songSortConfig } from '../stores/config.store'
	import type { ConfigType } from '../../../types/config.type'

	$: fillSongList($selectedAlbumsDir, $songSortConfig)
	$: $dbVersionStore !== 0 ? fillSongList($selectedAlbumsDir, $songSortConfig) : null

	$: if ($selectedAlbumsDir !== undefined) {
		localStorage.setItem('SelectedAlbumsDir', JSON.stringify($selectedAlbumsDir))
	}

	let lastSelectedAlbums = ''

	function fillSongList(albumRootDirList: string[] = [], sorting: ConfigType['userOptions']['songSort']) {
		if (JSON.stringify($selectedAlbumsDir) !== lastSelectedAlbums) {
			songListStore.set([])
			lastSelectedAlbums = JSON.stringify($selectedAlbumsDir)
		}

		if (albumRootDirList.length === 0) {
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
					order: [`${sorting.sortBy} ${sorting.sortOrder}`]
				}
			})
			.then(response => {
				// If the songs from the db is different from the songs in the song list store, update it.
				if (JSON.stringify($songListStore) !== JSON.stringify(response.results.data)) {
					songListStore.set(response.results.data)
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

		setTimeout(() => {
			scrollToAlbumFn(lastPlayedSongDirectory, 'smooth-scroll')
		}, 1000)
	}

	onMount(() => {
		loadPreviousState()
	})
</script>
