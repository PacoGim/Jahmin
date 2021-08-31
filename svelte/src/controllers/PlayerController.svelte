<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumColors } from '../service/getAlbumColors.fn'

	import { getAlbumIPC, getAlbumsIPC } from '../service/ipc.service'

	import {
		albumListStore,
		dbVersion,
		elementMap,
		playbackStore,
		playingSongStore,
		selectedAlbumId,
		selectedGroupByStore,
		selectedGroupByValueStore,
		selectedSongsStore,
		songListStore,
		triggerGroupingChangeEvent,
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

	$: {
		$dbVersion
		if (firstDbVersionAssign === true) {
			firstDbVersionAssign = false
		} else {
			if ($dbVersion !== 0) {
				getAlbums($selectedGroupByStore, $selectedGroupByValueStore)

				// Refills the current album selected songs to add them as they are found.
				getAlbumIPC($selectedAlbumId).then(result => {
					$songListStore = result.Songs
				})
			}
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then(result => ($albumListStore = result))
	}

	onMount(() => {
		document.addEventListener('click', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('dblclick', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('contextmenu', (evt: MouseEvent) => handleClickEvent(evt))

		loadPreviousState()
	})

	function loadPreviousState() {
		let lastPlayedAlbumId = localStorage.getItem('LastPlayedAlbumId')
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		getAlbumColors(lastPlayedAlbumId)

		$selectedAlbumId = lastPlayedAlbumId

		getAlbumIPC(lastPlayedAlbumId).then(result => {
			$songListStore = result.Songs

			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongId, false)
		})
	}

	function handleClickEvent(evt: MouseEvent) {
		$elementMap = new Map<string, HTMLElement>()

		evt.composedPath().forEach((element: HTMLElement) => {
			$elementMap.set(element.tagName, element)
		})

		const IMG_ELEMENT = $elementMap.get('IMG')
		const ALBUM_ELEMENT = $elementMap.get('ALBUM')
		const SONG_LIST_ITEM_ELEMENT = $elementMap.get('SONG-LIST-ITEM')
		// const GROUPING_SVLT = $elementMap.get('GROUPING-SVLT')
		// const SONG_LIST_ITEM_ELEMENT = $elementMap.get('SONG-LIST-ITEM')
		// const ART_GRID_SVLT_SVLT = $elementMap.get('ART-GRID-SVLT')
		// const SONG_LIST_SVLT = $elementMap.get('SONG-LIST-SVLT')
		// const TAG_EDIT_SVLT = $elementMap.get('TAG-EDIT-SVLT')

		if (ALBUM_ELEMENT) {
			const ALBUM_ID = ALBUM_ELEMENT.getAttribute('id')

			getAlbumIPC(ALBUM_ID).then(result => {
				if (evt.type === 'dblclick') {
					setNewPlayback(ALBUM_ID, result.Songs, undefined, true)
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
			const SONG_ID = Number(SONG_LIST_ITEM_ELEMENT.getAttribute('id'))

			if (evt.type === 'dblclick') {
				getAlbumIPC($selectedAlbumId).then(result => {
					setNewPlayback($selectedAlbumId, result.Songs, SONG_ID, true)
				})
			}

			if (evt.type === 'contextmenu') {
				if (!$selectedSongsStore.includes(SONG_ID)) {
					$selectedSongsStore = [SONG_ID]
				}
			}
		}

		if (IMG_ELEMENT) {
			if (IMG_ELEMENT.classList.contains('Player')) {
				let playingSong = $playingSongStore
				let albumID = hash(playingSong.SourceFile.split('/').slice(0, -1).join('/'), 'text') as string

				$selectedAlbumId = albumID
				$songListStore = $playbackStore
				$triggerGroupingChangeEvent = localStorage.getItem('GroupByValue')
				$triggerScrollToSongEvent = playingSong.ID
				$selectedSongsStore = [playingSong.ID]
				scrollToAlbumFn(albumID)
			}
		}
	}
</script>
