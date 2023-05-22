<script lang="ts">
	export let selectedLyric = {
		title: '',
		artist: ''
	}

	function openGeniusWebpage() {
		window.ipc.openGeniusWebpage(selectedLyric.title, selectedLyric.artist)
	}
</script>

<lyrics-header>
	<lyrics-name>{selectedLyric.title} - {selectedLyric.artist}</lyrics-name>
	<lyrics-genius on:click={openGeniusWebpage} on:keypress={openGeniusWebpage} tabindex="-1" role="button"
		>Find lyrics in <bold>Genius.com</bold></lyrics-genius
	>
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
		font-size: 1.75rem;
		font-variation-settings: 'wght' 700;
	}

	lyrics-genius {
		background-color: var(--color-accent-3);
		padding: 0.5rem 0.75rem;
		border-radius: 100vmax;
		cursor: pointer;
	}
</style>
