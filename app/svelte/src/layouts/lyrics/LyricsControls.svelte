<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let lyricsMode
</script>

<lyrics-controls>
	<button class={lyricsMode === 'Read' ? 'hide' : 'show'} on:click={() => dispatch('lyricsModeChange', 'Read')}>Read</button>
	<button class={lyricsMode === 'Edit' ? 'hide' : 'show'} on:click={() => dispatch('lyricsModeChange', 'Edit')}>Edit</button>
	<button class={lyricsMode === 'Edit' ? 'hide' : 'show'}>Save</button>
</lyrics-controls>

<style>
	lyrics-controls {
		grid-area: lyrics-controls;

		display: flex;
		flex-direction: row;
		justify-content: center;
		height: fit-content;
		align-self: center;
	}

	lyrics-controls button {
		transition: opacity 300ms ease-in-out;
		margin: 0 0.5rem;
	}
</style>
