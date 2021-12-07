<script lang="ts">
	import { onMount } from 'svelte'
	import { getAlbumColors } from '../functions/getAlbumColors.fn'
	import { hash } from '../functions/hashString.fn'
	import parseJson from '../functions/parseJson'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumIPC, getAlbumsIPC, saveConfig } from '../services/ipc.service'
	import { groupByConfig, groupByValuesConfig } from '../store/config.store'

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
			if (element.tagName) {
				$elementMap.set(element.tagName.toLowerCase(), element)
			}
		})

		const imgElement = $elementMap.get('img')
		const albumElement = $elementMap.get('album')
		const songListItemElement = $elementMap.get('song-list-item')
		const playerElement = $elementMap.get('player-svlt')

		if (albumElement) {
			const albumId = albumElement.getAttribute('id')

			getAlbumIPC(albumId).then(result => {
				if (evt.type === 'dblclick') {
					setNewPlayback(albumId, result.Songs, undefined, true)
					saveGroupingConfig()
				} else if (evt.type === 'click') {
					// Prevents resetting array if album unchanged.
					if ($selectedAlbumId !== albumId) {
						$selectedAlbumId = albumId
						$songListStore = result.Songs
					}

					// When clicking on an album, reset selected songs. Prevents songs from being selected after changing albums.
					$selectedSongsStore = []
				}
			})
		}

		if (songListItemElement) {
			const songId = Number(songListItemElement.getAttribute('id'))

			if (evt.type === 'dblclick') {
				getAlbumIPC($selectedAlbumId).then(result => {
					setNewPlayback($selectedAlbumId, result.Songs, songId, true)
				})

				saveGroupingConfig()
			}

			if (evt.type === 'contextmenu') {
				if (!$selectedSongsStore.includes(songId)) {
					$selectedSongsStore = [songId]
				}
			}
		}

		if (imgElement && playerElement) {
			let playingSong = $playingSongStore
			let albumID = imgElement.dataset.albumArtId

			$selectedAlbumId = albumID
			$songListStore = $playbackStore

			$triggerGroupingChangeEvent = parseJson(localStorage.getItem('GroupByValues'))

			$triggerScrollToSongEvent = playingSong.ID
			$selectedSongsStore = [playingSong.ID]
			scrollToAlbumFn(albumID)
		}
	}

	function saveGroupingConfig() {
		// Saves the grouping
		saveConfig({
			group: {
				groupBy: $groupByConfig,
				groupByValues: $groupByValuesConfig
			}
		})
	}
</script>
