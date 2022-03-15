<script lang="ts">
	import { onMount } from 'svelte'
	import parseJson from '../functions/parseJson'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { getAlbumIPC, saveConfig } from '../services/ipc.service'
	import { groupByConfig, groupByValuesConfig } from '../store/config.store'
	import {
		elementMap,
		playbackStore,
		playingSongStore,
		selectedAlbumId,
		selectedSongsStore,
		songListStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../store/final.store'

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

		if (albumElement) handleAlbumEvent(albumElement, evt.type)

		if (songListItemElement) handleSongListItemEvent(songListItemElement, evt.type)

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

	function handleAlbumEvent(element: HTMLElement, evtType: string) {
		const albumId = element.getAttribute('id')

		getAlbumIPC(albumId).then(result => {
			if (evtType === 'dblclick') {
				setNewPlayback(albumId, result.Songs, undefined, true)
				saveGroupingConfig()
			} else if (evtType === 'click') {
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

	function handleSongListItemEvent(element: HTMLElement, evtType: string) {
		const songId = Number(element.getAttribute('id'))

		if (evtType === 'dblclick') {
			getAlbumIPC($selectedAlbumId).then(result => {
				setNewPlayback($selectedAlbumId, result.Songs, songId, true)
			})

			saveGroupingConfig()
		}

		if (evtType === 'contextmenu') {
			if (!$selectedSongsStore.includes(songId)) {
				$selectedSongsStore = [songId]
			}
		}
	}

	function saveGroupingConfig() {
		localStorage.setItem('GroupByValues', JSON.stringify($groupByValuesConfig))
		// Saves the grouping
		saveConfig({
			group: {
				groupBy: $groupByConfig,
				groupByValues: $groupByValuesConfig
			}
		})
	}

	onMount(() => {
		document.addEventListener('click', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('dblclick', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('contextmenu', (evt: MouseEvent) => handleClickEvent(evt))
	})
</script>
