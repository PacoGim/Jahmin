<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let lyricsMode
</script>

<lyrics-controls>
	<button class={lyricsMode === 'Read' ? 'selected' : ''} on:click={() => dispatch('lyricsModeChange', 'Read')}>Read</button>
	<button class={lyricsMode === 'Edit' ? 'selected' : ''} on:click={() => dispatch('lyricsModeChange', 'Edit')}>Edit</button>
	<button class={lyricsMode === 'Edit' ? 'active' : 'inactive'} on:click={() => dispatch('saveLyrics')}>Save</button>
</lyrics-controls>

<style>
	lyrics-controls {
		position: relative;
		grid-area: lyrics-controls;

		display: flex;
		flex-direction: row;
		justify-content: left;
		height: fit-content;
		align-self: center;
		margin-bottom: 0.25rem;
		margin-left: 1rem;
	}

	lyrics-controls button {
		transition: opacity 300ms ease-in-out;
		margin: 0 0.25rem;
		background-color: var(--color-accent-1);

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		cursor: pointer;
		position: relative;
	}
	lyrics-controls button::after {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 0px solid var(--color-accent-1);
		border-radius: 5px;

		transition: border-color 300ms linear;
	}

	lyrics-controls button.selected::after {
		border: 2px solid var(--color-accent-3);
	}

	lyrics-controls button.selected {
		background-color: var(--color-accent-3);
	}

	lyrics-controls button.inactive {
		color: var(--color-accent-1);
		background-color: var(--color-bg-3);
		box-shadow: inset 0 0 0 2px var(--color-accent-1);
	}

	lyrics-controls button:first-of-type {
		margin-left: 0.5rem;
		margin-right: 1rem;
	}
</style>
