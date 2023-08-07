<script lang="ts">
	import { afterUpdate, onMount, tick } from 'svelte'
	import type { SongType } from '../../../../types/song.type'
	import SongListItem from '../../components/SongListItem.svelte'
	import cssVariablesService from '../../services/cssVariables.service'
	import songListClickEventHandlerService from '../../services/songListClickEventHandler.service'
	import { songAmountConfig, songListTagConfig } from '../../stores/config.store'

	import {
		elementMap,
		isMouseDown,
		keyModifier,
		keyPressed,
		mousePosition,
		playingSongStore,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		triggerScrollToSongEvent
	} from '../../stores/main.store'
	import SongListScrollBar from '../components/SongListScrollBar.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import updateConfigFn from '../../functions/updateConfig.fn'
	import SongTag from '../../components/SongTag.svelte'

	let songsToShow: SongType[] = []
	let scrollAmount = 0
	let previousScrollAmount = undefined

	let dataContainerElement

	let dataContainerWidth

	let saveConfigDebounce = undefined

	let scrolledAmount = 0

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

		cssVariablesService.set('song-list-svlt-height', `${songAmount * songListItemHeight + 16 + 30}px`)
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

	let elementActive: HTMLElement = undefined
	let elementPosX: number = undefined

	function handleOnMouseDownEvent(evt: MouseEvent) {
		let element = evt.target as HTMLElement

		if (element.nodeName !== 'DATA-SEPARATOR') return

		elementPosX = evt.pageX
		elementActive = element
	}

	function handleOnMouseUpEvent(e: MouseEvent) {
		elementPosX = undefined
	}

	function handleScrollEvent(e: MouseEvent) {
		let element = e.target as HTMLElement

		scrolledAmount = element.scrollLeft
	}

	mousePosition.subscribe(value => {
		if (elementPosX !== undefined && $isMouseDown === true) {
			let newPosX = value.x - elementPosX

			elementPosX = elementPosX + newPosX

			let tag = elementActive.dataset.tag

			let tagIndex = $songListTagConfig.findIndex(item => item.value === tag)

			let currentTag = $songListTagConfig[tagIndex]

			let newSize = currentTag.width + newPosX

			if (newSize <= 50) {
				newSize = 50
			}

			currentTag.width = newSize

			$songListTagConfig[tagIndex] = currentTag

			clearTimeout(saveConfigDebounce)
			saveConfigDebounce = setTimeout(() => {
				updateConfigFn(
					{
						songListTags: $songListTagConfig
					},
					{ doUpdateLocalConfig: false }
				)
			}, 1000)
		}
	})
</script>

<song-list-svlt
	on:mousewheel={e => scrollContainer(e)}
	on:click={e => songListClickEventHandlerService(e)}
	on:keypress={e => songListClickEventHandlerService(e)}
	on:scroll={handleScrollEvent}
	tabindex="-1"
	role="button"
>
	<data-container
		bind:this={dataContainerElement}
		on:mousedown={handleOnMouseDownEvent}
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
				<data-row
					data-id={song.ID}
					data-index={index}
					class="
				{song.IsEnabled === 0 ? 'disabled' : ''}
				{$playingSongStore.ID === song.ID ? 'playing' : ''}
				{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
				>
					{#each $songListTagConfig as tag, index (index)}
						<data-value style={`width: ${tag.width}px;`}>
							<SongTag {song} {tag} />
						</data-value>
						<data-separator data-tag={tag.value} />
					{/each}
				</data-row>
			{/each}
		</data-body>
	</data-container>

	<SongListBackground width={`${dataContainerWidth + 16}px`} />
	<SongListScrollBar on:songListBarScrolled={onSongListBarScrolled} {scrolledAmount} />
</song-list-svlt>

<style>
	song-list-svlt {
		position: relative;
	}
	data-separator {
		display: inline-block;
		width: 2px;
		background-color: transparent;
		margin: 0 0.25rem;
		cursor: col-resize;
	}
	data-container {
		margin: 0 1rem;

		/* margin-right: 1rem; */
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

	data-container data-row data-value {
		text-align: left;
	}
	data-container data-row data-value {
		padding: 0.25rem 0.5rem;
	}

	data-container data-header data-row data-value {
		font-variation-settings: 'wght' 700;
	}

	data-container data-header data-separator {
		transition: background-color 350ms linear;
	}
	data-container data-header:hover data-separator {
		background-color: #fff;
	}

	data-container data-body data-row data-separator {
		background-color: transparent;
		pointer-events: none;
	}

	data-container data-body data-row {
		cursor: pointer;
		min-height: var(--song-list-item-height);
		max-height: var(--song-list-item-height);
		height: var(--song-list-item-height);

		display: flex;
		align-items: center;

		border: 0.125rem transparent solid;
		background-clip: padding-box;
		padding: 0.5rem 0.5rem;
		user-select: none;
		border-radius: 10px;
		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;
	}

	data-container data-body data-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	data-container data-body data-row.playing {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		box-shadow: inset 0px 0px 0 2px rgba(255, 255, 255, 0.5);
	}

	song-list-svlt {
		position: relative;
		color: #fff;
		grid-area: song-list-svlt;
		display: grid;
		z-index: 2;

		position: relative;

		overflow: scroll;
		overflow-y: hidden;
	}
</style>
