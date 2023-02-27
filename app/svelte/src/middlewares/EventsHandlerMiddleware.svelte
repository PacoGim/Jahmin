<script lang="ts">
	import { onMount } from 'svelte'
	import getAlbumSongsFn from '../db/getAlbumSongs.fn'

	import isArrayEqualFn from '../functions/isArrayEqual.fn'
	import parseJsonFn from '../functions/parseJson.fn'

	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
  import toggleArrayElementFn from '../functions/toggleArrayElement.fn'
	import main from '../main'

	import {
		albumPlayingDirStore,
		activeSongStore,
		config,
		elementMap,
		layoutToShow,
		playbackStore,
		playingSongStore,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent,
		selectedAlbumsDir,
		keyModifier
	} from '../stores/main.store'

	function handleClickEvents(evt: MouseEvent) {
		$elementMap = new Map<string, HTMLElement>()

		evt.composedPath().forEach((element: HTMLElement) => {
			if (element.tagName) {
				$elementMap.set(element.tagName.toLowerCase(), element)
			}
		})

		const mainElementClicked = $elementMap.entries().next().value

		const imgElement = $elementMap.get('img')
		const albumElement = $elementMap.get('album')
		const songListItemElement = $elementMap.get('song-list-item') //! true
		const songListElement = $elementMap.get('song-list') //! false
		const controlBarElement = $elementMap.get('control-bar-svlt')
		const tagEditElement = $elementMap.get('tag-edit-svlt') //! false
		const artElement = $elementMap.get('art-svlt')
		const artGridElement = $elementMap.get('art-grid-svlt')

		if (albumElement) handleAlbumEvent(albumElement, evt.type)

		if (songListItemElement) handleSongListItemEvent(songListItemElement, evt.type)

		if (artElement && controlBarElement) setAlbumBackInView()

		if (songListElement === undefined && tagEditElement === undefined) {
			$selectedSongsStore = []
		}

		if (mainElementClicked[0] === 'art-grid-svlt') {
			$selectedAlbumsDir = []
		}
	}

	// function handleKeyboardEvents(evt: KeyboardEvent) {
	// 	let keyModifier = {
	// 		ctrl: evt.ctrlKey || evt.metaKey,
	// 		shift: evt.shiftKey,
	// 		alt: evt.altKey
	// 	}

	// 	if (evt.key === 'a' && keyModifier.ctrl === true) {
	// 		const songListElement = $elementMap.get('song-list')

	// 		if (songListElement) {
	// 			$selectedSongsStore = [...$songListStore.map(song => song.ID)]
	// 		}
	// 	}
	// }

	// Applies the proper states that make the album visible (Proper grouping, song list, etc.).
	function setAlbumBackInView() {
		$layoutToShow = 'Library'
		let playingSong = $playingSongStore

		$selectedAlbumsDir = [$albumPlayingDirStore]
		$selectedAlbumDir = $albumPlayingDirStore

		$songListStore = sortSongsArrayFn($playbackStore, $config.userOptions.sortBy, $config.userOptions.sortOrder)

		let groupByValuesLocalStorage = parseJsonFn(localStorage.getItem('GroupByValues'))

		if (!isArrayEqualFn(groupByValuesLocalStorage, $config.group.groupByValues)) {
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

		let songs = await getAlbumSongsFn(rootDir)

		let sortedSongs = sortSongsArrayFn(songs, $config.userOptions.sortBy, $config.userOptions.sortOrder, $config.group)

		if (evtType === 'dblclick') {
			setNewPlaybackFn(rootDir, sortedSongs, undefined, { playNow: true })
			saveGroupingConfig()
		} else if (evtType === 'click') {
			// window.ipc.verifyFolderTegrity(rootDir)

			// Prevents resetting array if album unchanged.
			// if ($selectedAlbumDir !== rootDir || songs.length === sortedSongs.length) {
			$songListStore = sortedSongs

			if ($keyModifier === 'ctrlKey') {
				$selectedAlbumsDir = toggleArrayElementFn($selectedAlbumsDir, rootDir)
			} else {
				$selectedAlbumsDir = [rootDir]
			}

			$selectedAlbumDir = rootDir
			// }

			// When clicking on an album, reset selected songs. Prevents songs from being selected after changing albums.
			$selectedSongsStore = []
		}
	}

	function handleSongListItemEvent(element: HTMLElement, evtType: string) {
		const songId = +element.dataset.id

		if (evtType === 'dblclick') {
			setNewPlaybackFn($selectedAlbumDir, $songListStore, songId, { playNow: true })

			saveGroupingConfig()
		}
	}

	function saveGroupingConfig() {
		localStorage.setItem('GroupByValues', JSON.stringify($config.group.groupByValues))
		// Saves the grouping
		window.ipc.saveConfig({
			group: {
				groupBy: $config.group.groupBy,
				groupByValues: $config.group.groupByValues
			}
		})
	}

	onMount(() => {
		;['click', 'dblclick', 'contextmenu'].forEach(evtType =>
			document.addEventListener(evtType, (evt: MouseEvent) => handleClickEvents(evt))
		)
		// ;['keydown'].forEach(evtType => document.addEventListener(evtType, (evt: KeyboardEvent) => handleKeyboardEvents(evt)))
	})
</script>
