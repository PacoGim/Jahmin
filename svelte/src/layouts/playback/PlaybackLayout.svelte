<script lang="ts">
	import { onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import SortableService from '../../services/sortable.service'

	import { playbackStore, playingSongStore, songPlayingIdStore } from '../../store/final.store'
	import { songToPlayUrlStore } from '../../store/player.store'
	import PlayButton from '../components/PlayButton.svelte'

	$: if ($playbackStore.length > 0) createSortableList()

	$: {
		console.log($playingSongStore)
	}

	let selectedSongsId = []

	function createSortableList() {
		let el = document.querySelector('playback-layout ul')

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
		let ulElement = document.querySelector('playback-layout ul')

		if (ulElement === undefined || ulElement === null) return

		let newOrder = []

		ulElement.querySelectorAll('li').forEach(liElement => {
			newOrder.push($playbackStore.find(song => song.ID === Number(liElement.dataset.songId)))
		})

		$playbackStore = newOrder
	}

	function playSong(evt: MouseEvent) {
		let listElement = getClosestElementFn(evt.target as HTMLElement, 'li')

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
	<ul id="items">
		{#each $playbackStore as song, index (song.ID)}
			<li class={selectedSongsId.includes(song.ID) ? 'selected' : null} data-song-id={song.ID} data-index={index}>
				<!-- {#if $playingSongStore.ID === song.ID}
					<play-button>
						<PlayButton customColor="#fff" customSize="0.75rem" />
					</play-button>
				{/if} -->

				<span>{song.Track}</span>
				<span>{song.Title}</span>
				<span>{song.SampleRate}</span>
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
		display: grid;
		align-items: center;
		list-style: none;
		padding: 0.15rem 0.3rem;
		cursor: pointer;

		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
	}

	playback-layout li:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.05);
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
