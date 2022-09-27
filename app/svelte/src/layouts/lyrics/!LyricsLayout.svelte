<script lang="ts">
	import iziToast from 'izitoast'
	import { onMount } from 'svelte'
	import parseLyricsFn from '../../functions/parseLyrics.fn'
	import SaveIcon from '../../icons/SaveIcon.svelte'
	import UpdateIcon from '../../icons/UpdateIcon.svelte'
	import notifyService from '../../services/notify.service'
	import { config, currentSongProgressStore, playingSongStore } from '../../stores/main.store'

	let lyricsText = ''

	let isEditModeOn: boolean = false

	let lyricsContainer: HTMLElement

	$: {
		if ($playingSongStore) {
			loadLyrics()
		}
	}

	function saveLyrics() {
		window.ipc
			.saveLyrics(lyricsText, $playingSongStore.Title, $playingSongStore.Artist, $playingSongStore.Duration)
			.then(response => {
				notifyService.success(response)
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}

	function loadLyrics() {
		window.ipc
			.getLyrics($playingSongStore.Title, $playingSongStore.Artist, $playingSongStore.Duration)
			.then(lyrics => {
				lyricsText = lyrics
				parseLyricsFn(lyrics, lyricsContainer)
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}
</script>

<lyrics-layout class="layout">
	<lyrics-layout-header>
		<song-information>
			{`${$playingSongStore?.Title} by ${$playingSongStore?.Artist}`}
		</song-information>

		<lyrics-controls>
			<event-wrapper on:click={() => (isEditModeOn = !isEditModeOn)}>
				<UpdateIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper on:click={() => saveLyrics()}>
				<SaveIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
		</lyrics-controls>
	</lyrics-layout-header>

	<lyrics-layout-body>
		{#if isEditModeOn === true}
			<textarea bind:value={lyricsText} />
		{:else}
			<!-- <lyrics-container style='text-align: {$config.};' bind:this={lyricsContainer} /> -->
		{/if}
	</lyrics-layout-body>
</lyrics-layout>

<style>
	lyrics-layout {
		height: 100%;
		display: flex;
		/* overflow-y: hidden; */
		flex-direction: column;
	}

	lyrics-layout-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 1rem;
	}

	song-information {
		font-size: 1.5rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 150);
	}

	lyrics-layout-body {
		height: 100%;
	}

	lyrics-controls {
		display: flex;
		flex-direction: row;
	}

	event-wrapper {
		cursor: pointer;
		background-color: var(--color-fg-1);
		display: flex;

		justify-content: center;
		align-items: center;
		padding: 0.25rem;
		border-radius: 3px;
	}

	event-wrapper:first-of-type {
		margin-right: 1rem;
	}

	textarea {
		font-family: inherit;
		font-size: inherit;
		resize: vertical;
		width: 100%;
		height: 100%;
		padding: 1rem;
		outline: none;
	}

	lyrics-container {
		display: block;
		margin: 1rem;
	}

	:global(lyrics-container p) {
		font-size: 1.25rem;
		line-height: normal;
	}
</style>
