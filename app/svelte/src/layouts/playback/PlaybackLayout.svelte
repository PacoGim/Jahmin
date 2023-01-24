<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import cssVariablesService from '../../services/cssVariables.service'
	import SortableService from '../../services/sortable.service'

	import Sortable from 'sortablejs'

	import { layoutToShow, playbackStore, playingSongStore } from '../../stores/main.store'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'

	$: if ($playbackStore.length > 0) {
		createSortableList()
	}

	let selectedSongsId = []

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album', 'Artist']

	let handleWindowResizeRunning = false

	function createSortableList() {
		let el = document.querySelector('playback-layout table')

		if (el === undefined || el === null) return

		SortableService.create(el, {
			multiDrag: true,
			animation: 150,
			selectedClass: 'selected',
			onEnd: onDragEnd,
			onSelect: onSelect,
			onDeselect: onDeselect
		})
	}

	function onSelect(evt) {
		if (evt.originalEvent.shiftKey === false && evt.originalEvent.ctrlKey === false && evt.originalEvent.metaKey === false) {
			deselectAll('onSelect')

			if (evt.item) {
				Sortable.utils.select(evt.item)
			}
		}
	}

	function onDeselect(evt) {
		if (evt.originalEvent.shiftKey === false && evt.originalEvent.ctrlKey === false && evt.originalEvent.metaKey === false) {
			deselectAll('onDeselect')
			if (evt.item) {
				Sortable.utils.select(evt.item)
			}
		}
	}

	function deselectAll(from) {
		console.log(from)
		document.querySelectorAll('table tr.selected').forEach(el => {
			Sortable.utils.deselect(el)
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

		console.log(clickedElement)

		/* 		let listElement = getClosestElementFn(evt.target as HTMLElement, 'tr')

		if (listElement === undefined || listElement === null) return

		let songId = listElement?.dataset?.songId

		if (songId === undefined || songId === null) return

		let songSourceFile = $playbackStore.find(song => song.ID === Number(songId))?.SourceFile

		if (songSourceFile === undefined || songSourceFile === null) return

		songToPlayUrlStore.set([songSourceFile, { playNow: true }]) */
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

	onMount(() => {
		createSortableList()

		window.addEventListener('resize', handleWindowResize)
	})

	onDestroy(() => {
		window.removeEventListener('resize', handleWindowResize)
	})
</script>

<selected-songs-preview />

<playback-layout on:dblclick={evt => playSongFoo(evt)}>
	<table>
		<tr class="table-header">
			{#each tempTags as tag, index (index)}
				<td>{renameTagName(tag)}</td>
			{/each}
			<td class="filler" />
		</tr>

		{#each $playbackStore as song, index (song.ID)}
			<tr class={selectedSongsId.includes(song.ID) ? 'selected' : ''} data-song-id={song.ID} data-index={index}>
				{#each tempTags as tag, index (index)}
					{#if tag === 'Track' && $playingSongStore.ID === song.ID}
						<td>
							<play-button>
								<PlayButton customColor="#fff" customSize="0.75rem" />
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
	playback-layout {
		display: flex;
		height: 100%;
		overflow-x: hidden;
		min-width: 100%;
		width: max-content;
		justify-content: center;
	}

	table tr.table-header {
		pointer-events: none;
		font-variation-settings: 'wght' 700;
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
