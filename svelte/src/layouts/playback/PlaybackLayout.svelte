<script lang="ts">
	import { onMount } from 'svelte'
	import { playbackStore } from '../../store/final.store'

	import { Sortable, MultiDrag } from 'sortablejs'

	$: if ($playbackStore.length > 0) createSortableList()

	let selectedSongsId = []

	function createSortableList() {
		let el = document.querySelector('playback-layout ul')

		if (el === undefined || el === null) return

		let sortable = Sortable.create(el, {
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
		let ulElement = document.querySelector('playback-layout ul')

		if (ulElement === undefined || ulElement === null) return

		let newOrder = []

		ulElement.querySelectorAll('li').forEach(liElement => {
			newOrder.push($playbackStore.find(song => song.ID === Number(liElement.dataset.songId)))
		})

		$playbackStore = newOrder
	}

	onMount(() => {
		Sortable.mount(new MultiDrag())
	})
</script>

<selected-songs-preview />

<playback-layout>
	<ul id="items">
		{#each $playbackStore as song, index (song.ID)}
			<li class={selectedSongsId.includes(song.ID) ? 'selected' : null} data-song-id={song.ID} data-index={index}>
				{song.Track} - {song.Title}
			</li>
		{/each}
	</ul>
</playback-layout>

<style>
	playback-layout {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	playback-layout li {
		list-style: none;
	}

	playback-layout li {
		padding: 0.5rem 1rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		cursor: pointer;
	}

	playback-layout li:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	playback-layout li.selected {
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
