<script lang="ts">
	import { afterUpdate, onMount, tick } from 'svelte'
	import type { SongType } from '../../../../types/song.type'
	import SongListItem from '../../components/SongListItem.svelte'
	import cssVariablesService from '../../services/cssVariables.service'
	import songListClickEventHandlerService from '../../services/songListClickEventHandler.service'
	import { songAmountConfig, songListTagConfig } from '../../stores/config.store'

	import {
		elementMap,
		keyModifier,
		keyPressed,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		triggerScrollToSongEvent
	} from '../../stores/main.store'
	import SongListScrollBar from '../components/SongListScrollBar.svelte'
	import SongListBackground from './SongListBackground.svelte'

	let songsToShow: SongType[] = []
	let scrollAmount = 0
	let previousScrollAmount = undefined

	let dataContainerElement

	let dataContainerWidth

	$: {
		$selectedAlbumDir
		previousScrollAmount = undefined
		setScrollAmount(0)
	}

	// Main Song List refresh trigger
	$: {
		$songListStore
		$songAmountConfig
		previousScrollAmount = undefined
		// trimSongArray()
	}

	$: {
		changeSongListHeight($songAmountConfig)
	}

	$: {
		if ($triggerScrollToSongEvent !== 0) {
			setScrollAmountFromSong($triggerScrollToSongEvent)
			$triggerScrollToSongEvent = 0
		}
	}

	$: {
		if ($keyModifier === 'ctrlKey' && $keyPressed === 'a' && $elementMap.get('song-list-svlt')) {
			selectAllSongs()
		}
	}

	$: if ($songListTagConfig && dataContainerElement) {
		setTimeout(() => {
			dataContainerWidth = dataContainerElement.getClientRects()[0].width
		}, 100)
	}

	/* 	afterUpdate(() => {
	})*/

	// tick().then(() => {
	// 	let dataContainerElement = document.querySelector('data-container')

	// 	console.log(dataContainerElement)
	// })

	function selectAllSongs() {
		const songListElement = $elementMap.get('song-list')

		if (songListElement) {
			$selectedSongsStore = [...$songListStore.map(song => song.ID)]
		}
	}

	// Trims the current song array to show a limited amount of songs.
	// function trimSongArray() {
	// if (scrollAmount !== previousScrollAmount) {
	// 	songsToShow = $songListStore.slice(scrollAmount, scrollAmount + $songAmountConfig)

	// 	if (songsToShow.length > 0) {
	// 		previousScrollAmount = scrollAmount
	// 	}
	// }
	// }

	/*
			<!-- <song-list> -->
	<!-- {#each $songListStore.slice(scrollAmount, scrollAmount + $songAmountConfig) as song, index (song.ID)} -->
	<!-- <SongListItem {song} {index} /> -->
	<!-- {/each} -->
	<!-- </song-list> -->
	<!-- <SongListScrollBar on:songListBarScrolled={onSongListBarScrolled} /> -->
	<!-- <SongListBackground /> -->
	<!-- </song-list> -->

	*/

	function setScrollAmount(amount) {
		if ($songListStore.length <= 0) {
			return
		}

		if (amount <= 0) {
			amount = 0
		} else if (amount > $songListStore.length - 1) {
			amount = $songListStore.length - 1
		}

		scrollAmount = amount

		// trimSongArray()

		setScrollProgress()
	}

	function onSongListBarScrolled(event) {
		setScrollAmount(event.detail)
	}

	function setScrollProgress() {
		let scrollValue = ((100 / ($songListStore.length - 1)) * scrollAmount) | 0
		cssVariablesService.set('scrollbar-fill', `${scrollValue}%`)
	}

	function changeSongListHeight(songAmount) {
		let songListItemHeight = Number(
			getComputedStyle(document.body).getPropertyValue('--song-list-item-height').replace('px', '')
		)

		cssVariablesService.set('song-list-svlt-height', `${songAmount * songListItemHeight + 16}px`)
	}

	function scrollContainer(e: WheelEvent) {
		setScrollAmount(scrollAmount + Math.sign(e.deltaY))
	}

	// Manages to "scroll" to the proper song on demand.
	function setScrollAmountFromSong(songId) {
		let songIndex = $songListStore.findIndex(song => song.ID === songId)

		let differenceAmount = Math.floor($songAmountConfig / 2)

		if (songIndex !== -1) {
			if (songIndex < differenceAmount) {
				setScrollAmount(0)
			} else {
				setScrollAmount(songIndex - differenceAmount)
			}
		}
	}

	// $: console.log($songListTagConfig)

	// onMount(() => {
	// 	setTimeout(() => {
	// 		$songListTagConfig[0] = {
	// 			value: 'Track',
	// 			width: 500
	// 		}
	// 	}, 2000)
	// })

	let elementActive = undefined

	function handleOnMouseDownEvent(e: MouseEvent) {
		let element = e.target as HTMLElement

		if (element.nodeName !== 'DATA-SEPARATOR') return

		elementActive = element
	}

	function handleOnMouseMoveEvent(e: MouseEvent) {
		// console.log(e)

		console.log(Math.sign(e.pageX - elementActive.getClientRects()[0].x))
	}

	function handleOnMouseUpEvent(e: MouseEvent) {
		// elementActive=undefined
	}
</script>

<song-list-svlt
	on:mousewheel={e => scrollContainer(e)}
	on:click={e => songListClickEventHandlerService(e)}
	on:keypress={e => songListClickEventHandlerService(e)}
	tabindex="-1"
	role="button"
>
	<data-container
		bind:this={dataContainerElement}
		on:mousedown={handleOnMouseDownEvent}
		on:mousemove={handleOnMouseMoveEvent}
		on:mouseup={handleOnMouseUpEvent}
		role="button"
		tabindex="0"
	>
		<data-header>
			<data-row>
				{#each $songListTagConfig as tag, index (index)}
					<data-value style={`width: ${tag.width}px;`}>{tag.value}</data-value>
					<data-separator data-tag={tag.value} />
				{/each}
			</data-row>
		</data-header>

		<data-body>
			{#each $songListStore.slice(scrollAmount, scrollAmount + $songAmountConfig) as song, index (song.ID)}
				<data-row>
					{#each $songListTagConfig as tag, index (index)}
						<data-value style={`width: ${tag.width}px;`}>{song[tag.value]}</data-value>
						<data-separator data-tag={tag.value} />
					{/each}
				</data-row>
			{/each}
		</data-body>
	</data-container>

	<SongListBackground width={`${dataContainerWidth}px`} />
</song-list-svlt>

<style>
	data-separator {
		display: inline-block;
		width: 10px;
		background-color: red;
		margin-right: 0.25rem;
		cursor: col-resize;
	}
	data-container {
		--width: 50px;
	}
	data-row {
		display: flex;
	}

	data-value {
		display: inline-block;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	song-list-svlt {
		position: relative;
		color: #fff;
		grid-area: song-list-svlt;
		display: grid;
		/* grid-template-columns: auto max-content; */
		z-index: 2;

		position: relative;

		overflow: scroll;

		/* background-color: red; */
		overflow-y: hidden;
		/* overflow-x: scroll; */
	}

	song-list {
		padding: 8px;
	}
</style>
