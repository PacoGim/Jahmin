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
	import { saveConfig } from '../services/ipc.service'
	import { groupByConfig, groupByValuesConfig, sortByConfig, sortOrderConfig } from '../store/config.store'
	import {
		albumPlayingDirStore,
		activeSongStore,
		elementMap,
		layoutToShow,
		playbackStore,
		playingSongStore,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../store/final.store'

	function handleClickEvents(evt: MouseEvent) {
		$elementMap = new Map<string, HTMLElement>()

		evt.composedPath().forEach((element: HTMLElement) => {
			if (element.tagName) {
				$elementMap.set(element.tagName.toLowerCase(), element)
			}
		})

		const imgElement = $elementMap.get('img')
		const albumElement = $elementMap.get('album')
		const songListItemElement = $elementMap.get('song-list-item')
		const songListElement = $elementMap.get('song-list')
		const controlBarElement = $elementMap.get('control-bar-svlt')
		const tagEditElement = $elementMap.get('tag-edit-svlt')

		if (albumElement) handleAlbumEvent(albumElement, evt.type)

		if (songListItemElement) handleSongListItemEvent(songListItemElement, evt.type)

		if (imgElement && controlBarElement) setAlbumBackInView()

		if (songListElement === undefined && tagEditElement === undefined) {
			$selectedSongsStore = []
			$activeSongStore = undefined
		}
	}

	function handleKeyboardEvents(evt: KeyboardEvent) {
		let keyModifier = {
			ctrl: evt.ctrlKey || evt.metaKey,
			shift: evt.shiftKey,
			alt: evt.altKey
		}

		if (evt.key === 'a' && keyModifier.ctrl === true) {
			const songListElement = $elementMap.get('song-list')

			if (songListElement) {
				$selectedSongsStore = [...$songListStore.map(song => song.ID)]
			}
		}
	}

	// Applies the proper states that make the album visible (Proper grouping, song list, etc.).
	function setAlbumBackInView() {
		$layoutToShow = 'Library'
		let playingSong = $playingSongStore

		$selectedAlbumDir = $albumPlayingDirStore

		$songListStore = sortSongsArrayFn($playbackStore, $sortByConfig, $sortOrderConfig)

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
			setNewPlayback(rootDir, sortedSongs, undefined, { playNow: true })
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
		const songId = +element.dataset.id

		if (evtType === 'dblclick') {
			setNewPlayback($selectedAlbumDir, $songListStore, songId, { playNow: true })

			saveGroupingConfig()
		}

		$activeSongStore = undefined
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
		;['click', 'dblclick', 'contextmenu'].forEach(evtType =>
			document.addEventListener(evtType, (evt: MouseEvent) => handleClickEvents(evt))
		)
		;['keydown'].forEach(evtType => document.addEventListener(evtType, (evt: KeyboardEvent) => handleKeyboardEvents(evt)))
	})
</script>
