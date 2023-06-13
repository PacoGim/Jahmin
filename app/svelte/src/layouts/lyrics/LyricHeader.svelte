<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'

	export let isLyricsDirty = false

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
		<lyrics-name isDirty={isLyricsDirty}>{selectedLyric.title} - {selectedLyric.artist}</lyrics-name>
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

		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	lyrics-name::before {
		content: '•';
		opacity: 1;
		font-size: 1rem;
		margin-right: 0.25rem;

		position: relative;
		top: -2px;

		transition: opacity 300ms linear;
	}

	lyrics-name[isDirty='false']::before {
		opacity: 0;
	}

	lyrics-genius {
		background-color: var(--color-accent-3);
		padding: 0.5rem 0.75rem;
		border-radius: 100vmax;
		cursor: pointer;

		flex: 1;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
