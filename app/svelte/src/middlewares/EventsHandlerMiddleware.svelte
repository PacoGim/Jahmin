<script lang="ts">
	import { onMount } from 'svelte'
	import getDirectoryFn from '../functions/getDirectory.fn'

	import setNewPlaybackFn from '../functions/setNewPlayback.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import toggleArrayElementFn from '../functions/toggleArrayElement.fn'
	import { configStore, groupByConfig, playbackShuffleConfig, songSortConfig } from '../stores/config.store'

	import {
		albumPlayingDirStore,
		elementMap,
		layoutToShow,
		playbackStore,
		playingSongStore,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		triggerScrollToSongEvent,
		selectedAlbumsDir,
		keyModifier,
		setSelectedAlbumsDir
	} from '../stores/main.store'
	import updateConfigFn from '../functions/updateConfig.fn'
	import { artGridEvents, tagGroupEvents } from '../stores/componentsEvents.store'
	import waitFn from '../functions/wait.fn'
	import type { SongType } from '../../../types/song.type'

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
		const songListSvltElement = $elementMap.get('song-list-svlt') //! false
		const controlBarElement = $elementMap.get('control-bar-svlt')
		const tagEditElement = $elementMap.get('tag-edit-svlt') //! false
		const artElement = $elementMap.get('art-svlt')
		const artGridElement = $elementMap.get('art-grid-svlt')

		const dataRowElement =
			$elementMap.get('song-list-svlt') &&
			$elementMap.get('data-container') &&
			$elementMap.get('data-body') &&
			$elementMap.get('data-row')
				? $elementMap.get('data-row')
				: undefined

		if (albumElement) handleAlbumEvent(albumElement, evt.type)

		if (dataRowElement) handleSongListItemEvent(dataRowElement, evt.type)

		if (songListItemElement) handleSongListItemEvent(songListItemElement, evt.type)

		if (artElement && controlBarElement) setAlbumBackInView()

		if (songListSvltElement === undefined && tagEditElement === undefined) {
			$selectedSongsStore = []
		}

		if (mainElementClicked[0] === 'art-grid-svlt') {
			setSelectedAlbumsDir([getDirectoryFn($playingSongStore?.SourceFile)])
		}
	}

	// Applies the proper states that make the album visible (Proper grouping, song list, etc.).
	async function setAlbumBackInView() {
		if ($layoutToShow !== 'Library') {
			$layoutToShow = 'Library'
			await waitFn(100)
		}

		let playingSong = $playingSongStore

		let directoryList = $playbackStore.reduce((acc: string[], curr: SongType) => {
			if (acc.indexOf(curr.Directory) === -1) {
				acc.push(curr.Directory)
			}

			return acc
		}, [])

		setSelectedAlbumsDir(directoryList)

		//TODO 1!1111123easrxdrfxfr
		$triggerScrollToSongEvent = playingSong.ID

		$tagGroupEvents.push({
			trigger: 'scroll',
			options: {
				behavior: 'instant',
				block: 'nearest'
			},
			query: `#group-${CSS.escape(String(playingSong[$groupByConfig]))}`
		})

		$tagGroupEvents.push({
			trigger: 'click',
			query: `#group-${CSS.escape(String(playingSong[$groupByConfig]))}`
		})

		$tagGroupEvents = $tagGroupEvents

		$artGridEvents.push({
			trigger: 'scroll',
			options: {
				behavior: 'instant',
				block: 'center'
			},
			query: `[rootDir="${CSS.escape($albumPlayingDirStore)}"]`
		})

		$artGridEvents = $artGridEvents
	}

	async function handleAlbumEvent(element: HTMLElement, evtType: string) {
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
					order: [`${$songSortConfig.sortBy} ${$songSortConfig.sortOrder}`]
				}
			})

			let sortedSongs = dbSongs.results.data

			setNewPlaybackFn(rootDir, sortedSongs, undefined, { playNow: true }, { shuffle: $playbackShuffleConfig })
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
			setNewPlaybackFn($selectedAlbumDir, $songListStore, songId, { playNow: true }, { shuffle: $playbackShuffleConfig })

			saveGroupingConfig()
		}
	}

	function saveGroupingConfig() {
		// Saves the grouping
		updateConfigFn(
			{
				group: {
					groupBy: $configStore.group.groupBy,
					groupByValue: $configStore.group.groupByValue
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
