<script lang="ts">
	import { onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import cssVariablesService from '../../services/cssVariables.service'
	import SortableService from '../../services/sortable.service'

	import { layoutToShow, playbackStore, playingSongStore } from '../../stores/main.store'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'

	$: if ($playbackStore.length > 0) createSortableList()

	let selectedSongsId = []

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album', 'Artist']

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
	<table>
		<tr>
			{#each tempTags as tag, index (index)}
				<td>{tag}</td>
			{/each}
			<td class="filler" />
		</tr>

		{#each $playbackStore as song, index (song.ID)}
			<tr>
				{#each tempTags as tag, index (index)}
					<td>{song[tag]}</td>
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

	table td {
		text-align: center;
	}

	table tr:nth-child(odd) {
		background-color: rgba(255, 255, 255, 0.05);
	}

	table tr:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.025);
	}
	table tr td {
		padding: 0.5rem;
	}

	table tr td:last-of-type {
		width: 40000px;
	}

	table {
		/* width: 100%; */
	}
</style>
