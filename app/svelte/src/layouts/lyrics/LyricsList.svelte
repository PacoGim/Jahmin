<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import limitCharactersFn from '../../functions/limitCharacters.fn'

	const dispatch = createEventDispatcher()

	export let selectedLyric = { title: '', artist: '' }

	export let lyricList = []

	function selectLyric(title: string, artist: string) {
		dispatch('selectedLyric', {
			title,
			artist
		})
	}
</script>

<lyrics-list>
	{#each lyricList as lyrics, index (index)}
		<lyrics-container
			class={lyrics.title === selectedLyric.title && lyrics.artist === selectedLyric.artist ? 'selected' : null}
			on:click={() => selectLyric(lyrics.title, lyrics.artist)}
			on:keypress={() => selectLyric(lyrics.title, lyrics.artist)}
			tabindex="-1"
			role="button">{limitCharactersFn(`${lyrics.title} - ${lyrics.artist}`, 40)}</lyrics-container
		>
	{/each}
</lyrics-list>

<style>
	lyrics-list {
		background-color: var(--color-bg-2);
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		overflow-y: auto;

		min-width: 300px;
	}

	lyrics-list lyrics-container {
		cursor: pointer;
		background-color: var(--color-bg-3);
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
		white-space: nowrap;
		font-size: 0.9rem;
		border-radius: 3px;
		border: 2px transparent solid;

		transition-property: color, background-color, border-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	lyrics-list lyrics-container:hover {
		border-color: var(--color-accent-1);
	}

	lyrics-list lyrics-container.selected {
		background-color: var(--color-accent-1);
		color: #fff;
	}
</style>
