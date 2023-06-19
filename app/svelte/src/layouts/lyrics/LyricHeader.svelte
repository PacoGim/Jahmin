<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'
	import SearchIcon from '../../icons/SearchIcon.svelte'

	export let isLyricsDirty = false

	export let selectedLyrics = null

	function openGeniusWebpage() {
		window.ipc.openGeniusWebpage(selectedLyrics.title, selectedLyrics.artist)
	}
</script>

<lyrics-header>
	{#if selectedLyrics !== null}
		<!-- ▼▼▼▼▼▼▼▼▼▼ If lyrics are selected ▼▼▼▼▼▼▼▼▼▼ -->

		<lyrics-name isDirty={isLyricsDirty}>{selectedLyrics.title} - {selectedLyrics.artist}</lyrics-name>

		<lyrics-genius on:click={openGeniusWebpage} on:keypress={openGeniusWebpage} tabindex="-1" role="button">
			Genius.com
			<SearchIcon style="height: 1rem; margin-left: .25rem;" />
		</lyrics-genius>

		<!-- ▲▲▲▲▲▲▲▲▲▲ If lyrics are selected ▲▲▲▲▲▲▲▲▲▲ -->
	{:else}
		<!-- ▼▼▼▼▼▼▼▼▼▼ If no lyrics are selected ▼▼▼▼▼▼▼▼▼▼ -->
		<lyrics-name isDirty={false}>No Lyrics Selected!</lyrics-name>
		<lyrics-genius on:click={openGeniusWebpage} on:keypress={openGeniusWebpage} tabindex="-1" role="button"
			><bold>Genius.com</bold></lyrics-genius
		>
	{/if}<!-- ▲▲▲▲▲▲▲▲▲▲ If no lyrics are selected ▲▲▲▲▲▲▲▲▲▲ -->
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

		/* background-color: var(--color-accent-1); */
		background: linear-gradient(90deg, rgba(102, 116, 209, 1) 0%, hsl(211, 75%, 58%) 100%);

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
		border-radius: 3px;
		cursor: pointer;
		font-variation-settings: 'wght' 700;

		display: flex;
		flex-direction: row;
		align-items: center;

		transition: font-variation-settings 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);

		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.25); /* x | y | blur | spread | color */
	}

	lyrics-genius:hover {
		font-variation-settings: 'wght' 900;
	}
</style>
