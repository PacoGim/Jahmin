<script lang="ts">
	import type { SongType } from '../../../../types/song.type'
	import cssVariablesService from '../../services/cssVariables.service'
	import songListClickEventHandlerService from '../../services/songListClickEventHandler.service'
	import { songAmountConfig, songListTagConfig, songSortConfig } from '../../stores/config.store'
	import type { ConfigType } from '../../../../types/config.type'

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
	import renameSongTagFn from '../../functions/renameSongTag.fn'
	import CaretIcon from '../../icons/CaretIcon.svelte'

	let scrollAmount = 0
	let previousScrollAmount = undefined

	let dataContainerElement: HTMLElement

	let dataContainerWidth: number

	let saveConfigDebounce: NodeJS.Timeout | undefined = undefined

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
	}

	$: changeSongListHeight($songAmountConfig)

	$: if ($triggerScrollToSongEvent !== 0) {
		setScrollAmountFromSong($triggerScrollToSongEvent)
		$triggerScrollToSongEvent = 0
	}

	$: if ($keyModifier === 'ctrlKey' && $keyPressed === 'a' && $elementMap?.get('song-list-svlt')) {
		selectAllSongs()
	}

	$: if (copyListTag && dataContainerElement) {
		setTimeout(() => {
			dataContainerWidth = dataContainerElement.getClientRects()[0].width
		}, 100)
	}

	let copyListTag: ConfigType['songListTags']

	songListTagConfig.subscribe(value => {
		copyListTag = JSON.parse(JSON.stringify(value))
	})

	function selectAllSongs() {
		$selectedSongsStore = [...$songListStore.map(song => song.ID)]
	}

	function setScrollAmount(amount: number) {
		if ($songListStore.length <= 0) {
			return
		}

		if (amount <= 0) {
			amount = 0
		} else if (amount > $songListStore.length - 1) {
			amount = $songListStore.length - 1
		}

		scrollAmount = amount

		setScrollProgress()
	}

	function onSongListBarScrolled(event: CustomEvent) {
		setScrollAmount(event.detail)
	}

	function setScrollProgress() {
		let scrollValue = ((100 / ($songListStore.length - 1)) * scrollAmount) | 0
		cssVariablesService.set('scrollbar-fill', `${scrollValue}%`)
	}

	function changeSongListHeight(songAmount: number) {
		let songListItemHeight = Number(
			getComputedStyle(document.body).getPropertyValue('--song-list-item-height').replace('px', '')
		)

		cssVariablesService.set('song-list-svlt-height', `${songAmount * songListItemHeight + 16 + 42}px`)
	}

	function scrollContainer(e: WheelEvent) {
		setScrollAmount(scrollAmount + Math.sign(e.deltaY))
	}

	// Manages to "scroll" to the proper song on demand.
	function setScrollAmountFromSong(songId: number) {
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

	function setStar(starChangeEvent: CustomEvent) {
		let eventDetails: { rating: number; song: SongType } = starChangeEvent.detail
		window.ipc.updateSongs([eventDetails.song], { Rating: eventDetails.rating })
	}

	let elementActive: HTMLElement | undefined = undefined
	let elementPosX: number | undefined = undefined

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

	function updateSort(tagToSortName: string) {
		let copySongSort = { ...$songSortConfig } as ConfigType['userOptions']['songSort']

		if (copySongSort === undefined) return

		if (copySongSort.sortBy === tagToSortName) {
			if (copySongSort.sortOrder === 'asc') {
				copySongSort.sortOrder = 'desc'
			} else {
				copySongSort.sortOrder = 'asc'
			}
		} else {
			let order: 'asc' | 'desc' = ['Rating', 'PlayCount', 'BitRate', 'SampleRate', 'Size'].includes(tagToSortName)
				? 'desc'
				: 'asc'

			copySongSort = {
				sortBy: tagToSortName,
				sortOrder: order
			}
		}

		updateConfigFn({
			userOptions: {
				songSort: copySongSort
			}
		})
	}

	mousePosition.subscribe(value => {
		if (elementPosX !== undefined && $isMouseDown === true && copyListTag !== undefined && value) {
			let newPosX = value?.x - elementPosX

			elementPosX = elementPosX + newPosX

			let tag = elementActive?.dataset.tag

			let tagIndex = copyListTag.findIndex(item => item.value === tag)

			let currentTag = copyListTag[tagIndex]

			let newSize = currentTag.width + newPosX

			if (newSize <= 25) {
				newSize = 25
			}

			currentTag.width = newSize

			copyListTag[tagIndex] = currentTag

			copyListTag = copyListTag

			clearTimeout(saveConfigDebounce)
			saveConfigDebounce = setTimeout(() => {
				updateConfigFn({
					songListTags: copyListTag
				})
			}, 1000)
		}
	})
</script>

<song-list-svlt
	on:mousewheel={scrollContainer}
	on:click={songListClickEventHandlerService}
	on:keypress={songListClickEventHandlerService}
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
				{#each copyListTag || [] as tag, index (index)}
					<data-value
						style={`width: ${tag.width}px;`}
						onClick={() => updateSort(tag.value)}
						data-selected={tag.value === $songSortConfig?.sortBy}
					>
						{renameSongTagFn(tag.value)}
						<icon-container>
							<CaretIcon
								style="fill: currentColor;height: 1rem; width: 1rem;transform: rotateZ({$songSortConfig?.sortOrder === 'desc'
									? '0'
									: '180'}deg);"
							/>
						</icon-container>
					</data-value>
					<data-separator data-tag={tag.value} />
				{/each}
			</data-row>
		</data-header>

		<data-body>
			{#each $songListStore.slice(scrollAmount, scrollAmount + $songAmountConfig) as song, index (song.ID)}
				<data-row
					data-id={song.ID}
					data-index={index}
					class:selected={$selectedSongsStore.includes(song.ID)}
					class:disabled={song.IsEnabled === 0}
					class:playing={$playingSongStore?.ID === song?.ID}
				>
					{#each copyListTag || [] as tag, index (index)}
						<data-value style={`width: ${tag.width}px;`}>
							<SongTag {song} {tag} on:starChange={setStar} />
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
		position: relative;
		display: inline-block;
		width: 2px;
		border-top: none;
		border-bottom: none;
		background-color: transparent;
		margin: 0 0.25rem;
		cursor: col-resize;
	}

	data-separator::before {
		position: absolute;
		content: '';
		transform: translateX(-2px);
		background-color: transparent;
		height: 100%;
		width: 2px;
		display: inline-block;
		cursor: col-resize;
	}

	data-separator::after {
		content: '';
		position: absolute;
		transform: translateX(2px);
		background-color: transparent;
		height: 100%;
		width: 2px;
		display: inline-block;
		cursor: col-resize;
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
		padding: 0.25rem 0.5rem;
	}

	data-container data-header data-row data-value {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-variation-settings: 'wght' 700;
		text-align: center;
		cursor: pointer;
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

		align-items: center;

		background-clip: padding-box;
		user-select: none;
		border-radius: 10px;
		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;
	}

	data-container data-header data-row {
		padding-bottom: 0;
	}

	data-container data-row {
		border: 0.125rem transparent solid;
		padding: 0.5rem 0.5rem;
	}

	/* data-container data-body data-row data-value { */
	/* background-color: blue; */
	/* } */

	data-container data-body data-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	data-container data-body data-row.selected {
		background-color: rgba(255, 255, 255, 0.1);
	}

	data-container data-body data-row.playing {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		box-shadow: inset 0px 0px 0 2px rgba(255, 255, 255, 0.5);
	}

	data-container data-body data-row.disabled {
		background-image: linear-gradient(
			45deg,
			rgba(255, 255, 255, 0) 25%,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0) 50%,
			rgba(255, 255, 255, 0) 75%,
			rgba(255, 255, 255, 0.1) 75%,
			rgba(255, 255, 255, 0.1) 100%
		);
		background-size: 28.28px 28.28px;
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

	data-container data-header data-row data-value icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin-left: 0.25rem;
		transition: opacity 300ms linear;
	}

	data-container data-header data-row data-value[data-selected='true'] icon-container {
		opacity: 1;
	}

	data-container data-header data-row data-value[data-selected='false'] icon-container {
		opacity: 0;
		max-width: 0px;
	}

	:global(data-container data-header data-row data-value[data-selected='false'] icon-container svg) {
		max-width: 0px;
	}
</style>
