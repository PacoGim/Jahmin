<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'

	export let selectedLyric = {
		title: '',
		artist: ''
	}

	function openGeniusWebpage() {
		window.ipc.openGeniusWebpage(selectedLyric.title, selectedLyric.artist)
	}
</script>

<lyrics-header>
	{#if selectedLyric.title && selectedLyric.artist}
		<lyrics-name>{selectedLyric.title} - {selectedLyric.artist}</lyrics-name>
		<lyrics-genius on:click={openGeniusWebpage} on:keypress={openGeniusWebpage} tabindex="-1" role="button"
			>Find <bold>“{limitCharactersFn(selectedLyric.title, 20)}”</bold> lyrics in <bold>Genius.com</bold></lyrics-genius
		>
	{:else}
		<lyrics-name />
		<lyrics-genius on:click={openGeniusWebpage} on:keypress={openGeniusWebpage} tabindex="-1" role="button"
			><bold>Genius.com</bold></lyrics-genius
		>
	{/if}
</lyrics-header>

<style>
	lyrics-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		grid-area: lyrics-name;

		margin: 1rem;
		padding: 1rem;

		border-radius: 3px;

		background-color: var(--color-accent-1);

		color: #fff;
	}

	lyrics-name {
		font-size: 1.25rem;
		font-variation-settings: 'wght' 700;
		user-select: text;
	}

	lyrics-genius {
		background-color: var(--color-accent-3);
		padding: 0.5rem 0.75rem;
		border-radius: 100vmax;
		cursor: pointer;
	}
</style>
