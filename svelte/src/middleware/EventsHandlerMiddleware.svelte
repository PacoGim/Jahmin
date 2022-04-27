<script lang="ts">
	import { onMount } from 'svelte'
	import { getAlbumSongs } from '../db/db'
	// import { db, getAlbumSongs } from '../db/db'
	import { hash } from '../functions/hashString.fn'
	import isArrayEqualFn from '../functions/isArrayEqual.fn'
	import parseJson from '../functions/parseJson'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { getAlbumIPC, saveConfig } from '../services/ipc.service'
	import { groupByConfig, groupByValuesConfig, sortByConfig, sortOrderConfig } from '../store/config.store'
	import {
		albumPlayingDirStore,
		elementMap,
		playbackStore,
		playingSongStore,
		selectedAlbumDir,
		selectedAlbumId,
		selectedSongsStore,
		songListStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../store/final.store'
	import type { SongType } from '../types/song.type'

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
		const controlBarElement = $elementMap.get('control-bar-svlt')

		if (albumElement) handleAlbumEvent(albumElement, evt.type)

		if (songListItemElement) handleSongListItemEvent(songListItemElement, evt.type)

		if (imgElement && controlBarElement) setAlbumBackInView()
	}

	// Applies the proper states that make the album visible (Proper grouping, song list, etc.).
	function setAlbumBackInView() {
		let playingSong = $playingSongStore

		$selectedAlbumDir = $albumPlayingDirStore
		$songListStore = $playbackStore

		let groupByValuesLocalStorage = parseJson(localStorage.getItem('GroupByValues'))

		if (!isArrayEqualFn(groupByValuesLocalStorage, $groupByValuesConfig)) {
			$triggerGroupingChangeEvent = groupByValuesLocalStorage
		}

		$triggerScrollToSongEvent = playingSong.ID
		$selectedSongsStore = [playingSong.ID]

		setTimeout(() => {
			scrollToAlbumFn($albumPlayingDirStore, 'not-smooth-scroll')
		}, 250)
	}

	async function handleAlbumEvent(element: HTMLElement, evtType: string) {
		const rootDir = element.getAttribute('rootDir')

		let songs = await getAlbumSongs(rootDir)

		let sortedSongs = sortSongsArrayFn(songs, $sortByConfig, $sortOrderConfig)

		if (evtType === 'dblclick') {
			setNewPlayback(rootDir, sortedSongs, undefined, true)
			saveGroupingConfig()
		} else if (evtType === 'click') {
			// Prevents resetting array if album unchanged.
			if ($selectedAlbumDir !== rootDir) {
				$songListStore = sortedSongs
				$selectedAlbumDir = rootDir
			}

			// When clicking on an album, reset selected songs. Prevents songs from being selected after changing albums.
			$selectedSongsStore = []
		}
	}

	function handleSongListItemEvent(element: HTMLElement, evtType: string) {
		const songId = Number(element.getAttribute('id'))

		if (evtType === 'dblclick') {
			setNewPlayback($selectedAlbumDir, $songListStore, songId, true)

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
