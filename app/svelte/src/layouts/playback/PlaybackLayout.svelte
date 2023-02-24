<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import cssVariablesService from '../../services/cssVariables.service'
	import SortableService from '../../services/sortable.service'

	import Sortable from 'sortablejs'

	import { config, playbackStore, playingSongStore } from '../../stores/main.store'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'

	$: if ($playbackStore.length > 0) {
		createSortableList()
	}

	let selectedSongsId = []

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album', 'Artist']

	let handleWindowResizeRunning = false

	let heightPercent = 0

	function createSortableList() {
		let el = document.querySelector('playback-layout table')

		if (el === undefined || el === null) return

		SortableService.create(el, {
			multiDrag: true,
			animation: 150,
			selectedClass: 'selected',
			filter: '.static',
			onEnd: onDragEnd,
			onSelect: onSelectDeselect,
			onDeselect: onSelectDeselect,
			onMove: function (e) {
				return e.related.className.indexOf('static') === -1
			}
		})
	}

	function onSelectDeselect(evt) {
		if (evt.originalEvent.shiftKey === false && evt.originalEvent.ctrlKey === false && evt.originalEvent.metaKey === false) {
			deselectAll().then(() => {
				Sortable.utils.select(evt.item)
			})
		}
	}

	function deselectAll() {
		return new Promise(resolve => {
			document.querySelectorAll('table tr.selected').forEach((el, index, list) => {
				Sortable.utils.deselect(el)

				if (index === list.length - 1) {
					resolve(null)
				}
			})
		})
	}

	function onDragEnd(evt) {
		let tableElement = document.querySelector('playback-layout table')

		if (tableElement === undefined || tableElement === null) return

		let newOrder = []

		tableElement.querySelectorAll('tr[data-song-id]').forEach((trElement: HTMLTableRowElement) => {
			newOrder.push($playbackStore.find(song => song.ID === Number(trElement.dataset.songId)))
		})

		$playbackStore = newOrder
	}

	function playSongFoo(evt: MouseEvent) {
		let clickedElement = getClosestElementFn(evt.target as HTMLElement, 'tr')

		if (clickedElement === undefined || clickedElement === null) return

		let songId = clickedElement?.dataset?.songId

		if (songId === undefined || songId === null) return

		let songSourceFile = $playbackStore.find(song => song.ID === Number(songId))?.SourceFile

		if (songSourceFile === undefined || songSourceFile === null) return

		songToPlayUrlStore.set([songSourceFile, { playNow: true }])
	}

	function calculateTableFillerWidth() {
		let windowWidth = window.innerWidth
		let navbarWidth = document.querySelector('navigation-svlt').getBoundingClientRect().width
		let tableHeaderWidth = 0

		document.querySelectorAll('playback-layout table tr.table-header td:not(.filler)').forEach(element => {
			tableHeaderWidth = tableHeaderWidth + element.getBoundingClientRect().width
		})

		cssVariablesService.set('table-filler-width', `${Math.abs(navbarWidth + tableHeaderWidth - windowWidth)}px`)
	}

	function renameTagName(tagName) {
		return {
			Track: '#',
			Title: 'Title',
			SampleRate: 'Sample Rate',
			Artist: 'Artist',
			Album: 'Album'
		}[tagName]
	}

	function handleWindowResize() {
		if (handleWindowResizeRunning === true) return

		handleWindowResizeRunning = true
		setTimeout(() => {
			calculateTableFillerWidth()
			handleWindowResizeRunning = false
		}, 125)
	}

	function onTableHeaderClick(evt: MouseEvent) {
		let tdElement = evt.composedPath().filter((element: HTMLElement) => element.tagName === 'TD')[0] as HTMLElement

		$playbackStore = sortSongsArrayFn($playbackStore, tdElement.innerHTML, $config.userOptions.sortOrder)
	}

	function calculateScroll(evt) {
		let maxHeight = Math.abs(evt.target.scrollHeight - evt.target.clientHeight)
		let currentHeight = evt.target.scrollTop
		heightPercent = Math.round((100 / maxHeight) * currentHeight)
	}

	onMount(() => {
		createSortableList()
		setTimeout(() => {
			calculateTableFillerWidth()
		}, 1000)

		window.addEventListener('resize', handleWindowResize)
	})

	onDestroy(() => {
		window.removeEventListener('resize', handleWindowResize)
	})
</script>

<scroll-bar> <scroll-bar-progress style="width:{heightPercent}%;" /></scroll-bar>

<playback-layout on:scroll={calculateScroll} on:dblclick={evt => playSongFoo(evt)}>
	<table>
		<tr class="table-header static" on:click={onTableHeaderClick}>
			{#each tempTags as tag, index (index)}
				<td>{renameTagName(tag)}</td>
			{/each}
			<td class="filler" />
		</tr>

		{#each $playbackStore as song, index (index)}
			<tr class={selectedSongsId.includes(song.ID) ? 'selected' : ''} data-song-id={song.ID} data-index={index}>
				{#each tempTags as tag, index (index)}
					{#if tag === 'Track' && $playingSongStore.ID === song.ID}
						<td>
							<play-button>
								<PlayButton customColor="var(--color-fg-1)" customSize="0.75rem" />
							</play-button>
							{song[tag]}
						</td>
					{:else}
						<td>{song[tag]}</td>
					{/if}
				{/each}

				<td class="filler" />
			</tr>
		{/each}
	</table>
</playback-layout>

<style>
	scroll-bar {
		border-radius: 3px;
		background-color: hsl(0, 0%, 50%, 0.5);
		display: block;
		height: 10px;
		width: calc(100% - 1rem);
		position: relative;
		margin: 0.5rem;
		margin-bottom: 0;
	}

	scroll-bar-progress {
		border-radius: inherit;
		position: absolute;
		background-color: var(--color-reactBlue);
		height: inherit;
	}

	playback-layout {
		display: flex;
		height: calc(100% - 10px - 0.5rem);
		/* height: 100%; */
		overflow-x: hidden;
		min-width: 100%;
		width: max-content;
		justify-content: center;
	}
	playback-layout::-webkit-scrollbar {
		display: none;
	}

	playback-layout table {
		border-spacing: 0px;
		height: max-content;
	}

	table tr.table-header {
		font-variation-settings: 'wght' 700;
	}

	table tr.table-header td {
		pointer-events: all;
		cursor: pointer;
	}
	table tr:not(.table-header) {
		cursor: pointer;
	}

	table tr:nth-child(odd) {
		background-color: rgba(255, 255, 255, 0.05);
	}

	table tr:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.025);
	}

	table tr.selected {
		background-color: rgba(255, 255, 255, 0.1);
		box-shadow: inset 0 -1px 0 1px rgba(255, 255, 255, 0.1);
		font-variation-settings: 'wght' 600;
	}
	table tr td {
		padding: 0.5rem;
		text-align: center;
	}

	table tr td play-button {
		display: inline-block;
		margin-right: 0.125rem;
	}

	table tr td:last-of-type {
		width: var(--table-filler-width);
	}
</style>
