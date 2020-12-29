<script lang="ts">
	import { onMount } from 'svelte'
	import type { TagType } from '../../types/tag.type'
	import { songIndex } from '../store/player.store'

	export let song: TagType
	export let index: number

	onMount(() => {
		// console.log(song)
	})

	function parseDuration(duration: number) {
		if (duration >= 60 * 60) {
			return new Date(duration * 1000).toISOString().substr(11, 8)
		} else {
			return new Date(duration * 1000).toISOString().substr(14, 5)
		}
	}
</script>

<song-list-item on:dblclick={() => ($songIndex = index)} class={$songIndex === index ? 'selected' : ''}>
	<song-number>{song['Track']}</song-number>
	<song-title>{song['Title']}</song-title>
	<song-duration>{parseDuration(song['Duration'])}</song-duration>
</song-list-item>

<style>
	song-list-item {
		cursor: pointer;

		display: grid;
		grid-template-columns: max-content auto max-content;
		grid-template-rows: auto;

		margin: 0.25rem 0;
		padding: 0.25rem 0.5rem;
		user-select: none;

		transition: font-variation-settings ease-in-out 0.3s;
	}

	song-list-item > * {
		padding: 0 0.5rem;
	}

	song-list-item.selected {
		font-variation-settings: 'wght' 156;
		border-radius: 5px;
		background-color: rgba(255, 255, 255, 0.25);
	}
</style>
