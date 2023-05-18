<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let lyricsMode
</script>

<lyrics-controls>
	<button class={lyricsMode === 'Read' ? 'active' : 'inactive'} on:click={() => dispatch('lyricsModeChange', 'Read')}
		>Read</button
	>
	<button class={lyricsMode === 'Edit' ? 'active' : 'inactive'} on:click={() => dispatch('lyricsModeChange', 'Edit')}
		>Edit</button
	>
	<button class={lyricsMode === 'Edit' ? 'active' : 'inactive'}>Save</button>
</lyrics-controls>

<style>
	lyrics-controls {
		grid-area: lyrics-controls;

		display: flex;
		flex-direction: row;
		justify-content: left;
		height: fit-content;
		align-self: center;
	}

	lyrics-controls button {
		transition: opacity 300ms ease-in-out;
		margin: 0 0.25rem;
	}

	lyrics-controls button.active {
		background-color: var(--color-accent-1);
	}

	lyrics-controls button.inactive {
		background-color: var(--color-bg-1);
		color: var(--color-accent-1);
		border: 1px var(--color-accent-1) solid;
	}

	lyrics-controls button:first-of-type {
		margin-left: 0.5rem;
		margin-right: 1rem;
	}
</style>
