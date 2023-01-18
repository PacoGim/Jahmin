<script lang="ts">
	import { onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import SortableService from '../../services/sortable.service'

	import { playbackStore, playingSongStore } from '../../stores/main.store'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'

	$: if ($playbackStore.length > 0) createSortableList()

	let selectedSongsId = []

	function createSortableList() {
		let el = document.querySelector('playback-layout table')

		if (el === undefined || el === null) return

		SortableService.create(el, {
			multiDrag: true,
			animation: 150,
			selectedClass: null,
			onEnd: onDragEnd,
			onSelect: onSelect,
			onDeselect: onDeselect
		})
	}

	function onSelect(evt) {
		selectedSongsId = evt.items.map(liElement => Number(liElement.dataset.songId))
	}

	function onDeselect(evt) {
		selectedSongsId = []
	}

	function onDragEnd(evt) {
		let ulElement = document.querySelector('playback-layout table')

		if (ulElement === undefined || ulElement === null) return

		let newOrder = []

		ulElement.querySelectorAll('tr').forEach(liElement => {
			newOrder.push($playbackStore.find(song => song.ID === Number(liElement.dataset.songId)))
		})

		$playbackStore = newOrder
	}

	function playSong(evt: MouseEvent) {
		let listElement = getClosestElementFn(evt.target as HTMLElement, 'tr')

		if (listElement === undefined || listElement === null) return

		let songId = listElement?.dataset?.songId

		if (songId === undefined || songId === null) return

		let songSourceFile = $playbackStore.find(song => song.ID === Number(songId))?.SourceFile

		if (songSourceFile === undefined || songSourceFile === null) return

		songToPlayUrlStore.set([songSourceFile, { playNow: true }])
	}

	onMount(() => {
		createSortableList()
	})
</script>

<selected-songs-preview />

<playback-layout on:dblclick={evt => playSong(evt)}>

	<main-grid>

		{#each $playbackStore as song, index (song.ID)}
		<row>
			<span>{song.Track}</span>
			<span>{song.Title}</span>
			<span>{song.SampleRate}</span>
		</row>
		{/each}

	</main-grid>

	<!-- <main-grid>
		{#each $playbackStore as song, index (song.ID)}
			<sub-grid class={selectedSongsId.includes(song.ID) ? 'selected' : null} data-song-id={song.ID} data-index={index}>
				<span>{song.Track}</span>
				<span>{song.Title}</span>
				<span>{song.SampleRate}</span>
			</sub-grid>
		{/each}
	</main-grid> -->

	<!-- 	<ul id="items">
		{#each $playbackStore as song, index (song.ID)}
			<li class={selectedSongsId.includes(song.ID) ? 'selected' : null} data-song-id={song.ID} data-index={index}>
				<span>
					{#if $playingSongStore.ID === song.ID}
						<play-button>
							<PlayButton customColor="#fff" customSize="0.75rem" />
						</play-button>
					{/if}
					{song.Track}
				</span>
				<span>{song.Title}</span>
				<span>{song.SampleRate}</span>
			</li>
		{/each}
	</ul> -->
</playback-layout>

<style>

	main-grid{
		display: grid;
		grid-template-columns: max-content auto max-content;
	}

	row{
		display: contents;
	}
	span{

	}

	playback-layout {
		/* --row-height: 1.25rem; */

		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: scroll;

		/* background: repeating-linear-gradient(
			transparent,
			transparent var(--row-height),
			rgba(255, 255, 255, 0.05) var(--row-height),
			rgba(255, 255, 255, 0.05) calc(var(--row-height) * 2)
		); */
	}
	playback-layout table {
		table-layout: fixed;
		/* width: min-content; */
		width: 100%;
	}

	playback-layout table tr {
		/* height: var(--row-height); */
		width: 100%;
	}
	playback-layout table tr td {
		/* display: inline-block; */
		height: 100%;
		white-space: nowrap;
		/* width: 100px; */
		/* max-width: 80px; */
	}

	playback-layout table tr td:last-of-type {
		/* column-span: 3; */
	}

	playback-layout li play-button {
		display: inline-block;
	}
	playback-layout li {
		display: grid;
		align-items: center;
		list-style: none;
		padding: 0.15rem 0.3rem;
		cursor: pointer;

		grid-template-columns: repeat(4, max-content);
	}

	playback-layout tr:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.05);
	}

	playback-layout tr:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	playback-layout tr.selected {
		background-color: rgba(255, 255, 255, 0.1);
	}

	selected-songs-preview {
		pointer-events: none;
		position: fixed;
		opacity: 0;
		top: 0;
		left: 0;
		z-index: 99999;
	}
</style>
