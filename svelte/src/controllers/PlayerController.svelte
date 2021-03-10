<script lang="ts">
	import { onMount } from 'svelte'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumColors } from '../service/getAlbumColors.fn'

	import { getAlbumIPC, getAlbumsIPC } from '../service/ipc.service'

	import {
		albumListStore,
		selectedAlbumId,
		selectedGroupByStore,
		selectedGroupByValueStore,
		selectedSongsStore,
		songListStore
	} from '../store/final.store'

	let firstGroupByAssigns = true

	$: {
		if (firstGroupByAssigns === true) {
			firstGroupByAssigns = false
		} else {
			getAlbums($selectedGroupByStore, $selectedGroupByValueStore)
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then((result) => ($albumListStore = result))
	}

	onMount(() => {
		document.addEventListener('click', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('dblclick', (evt: MouseEvent) => handleClickEvent(evt))

		loadPreviousState()
	})

	function loadPreviousState() {
		let lastPlayedAlbumId = localStorage.getItem('LastPlayedAlbumID')
		// let lastPlayedSongId = localStorage.getItem('LastPlayedSongID')
		let lastPlayedSongIndex = Number(localStorage.getItem('LastPlayedSongIndex'))

		getAlbumColors(lastPlayedAlbumId)

		$selectedAlbumId = lastPlayedAlbumId

		getAlbumIPC(lastPlayedAlbumId).then((result) => {
			$songListStore = result.Songs

			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongIndex, false)
		})
	}

	function handleClickEvent(evt: MouseEvent) {
		let elementMap = new Map<string, HTMLElement>()

		evt.composedPath().forEach((element: HTMLElement) => {
			elementMap.set(element.tagName, element)
		})

		const ALBUM_ELEMENT = elementMap.get('ALBUM')
		const SONG_LIST_ITEM_ELEMENT = elementMap.get('SONG-LIST-ITEM')
		const SONG_LIST_SVLT = elementMap.get('SONG-LIST-SVLT')
		const TAG_EDIT_SVLT = elementMap.get('TAG-EDIT-SVLT')

		if (ALBUM_ELEMENT) {
			const ALBUM_ID = ALBUM_ELEMENT.getAttribute('id')

			getAlbumIPC(ALBUM_ID).then((result) => {
				if (evt.type === 'dblclick') {
					setNewPlayback(ALBUM_ID, result.Songs, 0, true)
				} else if (evt.type === 'click') {
					// Prevents resetting array if album unchanged.

					if ($selectedAlbumId !== ALBUM_ID) {
						$selectedAlbumId = ALBUM_ID
						$songListStore = result.Songs
					}
				}
			})
		}

		if (SONG_LIST_ITEM_ELEMENT) {
			const SONG_INDEX = Number(SONG_LIST_ITEM_ELEMENT.getAttribute('index'))

			if (evt.type === 'dblclick') {
				getAlbumIPC($selectedAlbumId).then((result) => {
					setNewPlayback($selectedAlbumId, result.Songs, SONG_INDEX, true)
				})
			}
		}

		if (!(SONG_LIST_SVLT || TAG_EDIT_SVLT)) {
			$selectedSongsStore = []
		}
	}
</script>
