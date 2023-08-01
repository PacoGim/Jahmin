<script lang="ts">
	import { onMount } from 'svelte'
	import getDirectoryFn from '../functions/getDirectory.fn'

	import isArrayEqualFn from '../functions/isArrayEqual.fn'
	import parseJsonFn from '../functions/parseJson.fn'

	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import toggleArrayElementFn from '../functions/toggleArrayElement.fn'
	import { config, groupByConfig, groupByValueConfig } from '../stores/config.store'

	import {
		albumPlayingDirStore,
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
		keyModifier,

		setSelectedAlbumsDir

	} from '../stores/main.store'
	import updateConfigFn from '../functions/updateConfig.fn'

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
			setSelectedAlbumsDir([getDirectoryFn($playingSongStore?.SourceFile)])
			// $selectedAlbumsDir = [getDirectoryFn($playingSongStore?.SourceFile)]
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

		setSelectedAlbumsDir([$albumPlayingDirStore])
		// $selectedAlbumsDir = [$albumPlayingDirStore]
		// $selectedAlbumDir = $albumPlayingDirStore

		$songListStore = sortSongsArrayFn($playbackStore, $config.userOptions.sortBy, $config.userOptions.sortOrder)

		let groupElement: HTMLElement = document.querySelector(`#group-${playingSong[$groupByConfig]}`)

		groupElement.click()

		groupElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })

		$triggerScrollToSongEvent = playingSong.ID
		$selectedSongsStore = [playingSong.ID]

		setTimeout(() => {
			scrollToAlbumFn($albumPlayingDirStore, 'not-smooth-scroll')
		}, 1000)
	}

	async function handleAlbumEvent(element: HTMLElement, evtType: string) {
		// Get all song from albums
		const rootDir = element.getAttribute('rootDir')

		if (evtType === 'dblclick') {
			let dbSongs = await window.ipc.bulkRead({
				queryData: {
					select: ['*'],
					andWhere: [
						{
							Directory: rootDir
						}
					],
					order: [`${$config.userOptions.sortBy} ${$config.userOptions.sortOrder}`]
				}
			})

			let sortedSongs = dbSongs.results.data

			setNewPlaybackFn(rootDir, sortedSongs, undefined, { playNow: true })
			saveGroupingConfig()
		} else if (evtType === 'click') {


			if ($keyModifier === 'ctrlKey') {
				setSelectedAlbumsDir(toggleArrayElementFn($selectedAlbumsDir, rootDir))
				// $selectedAlbumsDir = toggleArrayElementFn($selectedAlbumsDir, rootDir)
			} else {
				setSelectedAlbumsDir([rootDir])
				// $selectedAlbumsDir = [rootDir]
			}

			$selectedAlbumDir = rootDir

			// When clicking on an album, reset selected songs. Prevents songs from being selected after changing albums.
			$selectedSongsStore = []

			// if (
			// 	$selectedAlbumsDir.sort((a, b) => a.localeCompare(b)).toString() !==
			// 	tempSelectedAlbums.sort((a, b) => a.localeCompare(b)).toString()
			// ) {
			// 	setTimeout(() => {
			// 		$triggerScrollToSongEvent = sortedSongs[0].ID
			// 	}, 10)
			// }
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
		// Saves the grouping
		updateConfigFn(
			{
				group: {
					groupBy: $config.group.groupBy,
					groupByValue: $config.group.groupByValue
				}
			},
			{ doUpdateLocalConfig: false }
		)
	}

	onMount(() => {
		;['click', 'dblclick', 'contextmenu'].forEach(evtType =>
			document.addEventListener(evtType, (evt: MouseEvent) => handleClickEvents(evt))
		)
		// ;['keydown'].forEach(evtType => document.addEventListener(evtType, (evt: KeyboardEvent) => handleKeyboardEvents(evt)))
	})
</script>
