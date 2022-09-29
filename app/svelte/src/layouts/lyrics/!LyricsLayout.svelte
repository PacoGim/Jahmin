<script lang="ts">
	import EyeIcon from '../../icons/EyeIcon.svelte'
	import SaveIcon from '../../icons/SaveIcon.svelte'
	import UpdateIcon from '../../icons/UpdateIcon.svelte'
	import notifyService from '../../services/notify.service'
	import { keyModifier, keyPressed, playingSongStore } from '../../stores/main.store'
	import LyricsRead from './LyricsRead.svelte'
	import LyricsEdit from './LyricsEdit.svelte'

	let lyrics

	let selectedView: 'read' | 'edit' | 'time' = 'read'

	$: {
		if ($playingSongStore) {
			loadLyrics()
		}
	}

	$: if ($keyPressed === 's' && $keyModifier === 'ctrlKey') saveLyrics()

	function loadLyrics() {
		window.ipc
			.getLyrics($playingSongStore.Title, $playingSongStore.Artist, $playingSongStore.Duration)
			.then(response => {
				lyrics = response
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}

	function saveLyrics() {
		window.ipc
			.saveLyrics(lyrics, $playingSongStore.Title, $playingSongStore.Artist, $playingSongStore.Duration)
			.then(response => {
				notifyService.success(response)
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}

	function onLyricsUpdate({ detail }) {
		lyrics = detail
	}
</script>

<lyrics-layout class="layout">
	<lyrics-layout-header>
		<song-information>
			{`${$playingSongStore?.Title} by ${$playingSongStore?.Artist}`}
		</song-information>

		<lyrics-controls>
			<event-wrapper disabled={selectedView === 'read'} on:click={() => (selectedView = 'read')}>
				<EyeIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper disabled={selectedView === 'edit'} on:click={() => (selectedView = 'edit')}>
				<UpdateIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper disabled={selectedView !== 'edit'} on:click={() => saveLyrics()}>
				<SaveIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
		</lyrics-controls>
	</lyrics-layout-header>

	<lyrics-layout-body>
		{#if selectedView === 'edit'}
			<LyricsEdit {lyrics} on:lyricsUpdate={onLyricsUpdate} />
		{:else if selectedView === 'read'}
			<LyricsRead {lyrics} />
		{/if}
	</lyrics-layout-body>
</lyrics-layout>

<style>
	lyrics-layout {
		height: 100%;
		display: grid;

		grid-template-rows: max-content auto;
	}

	lyrics-layout-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	song-information {
		font-size: 1.5rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 150);
	}

	lyrics-layout-body {
		display: block;
		overflow-x: hidden;
		overflow-y: scroll;
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
		margin-right: 1rem;
	}

	event-wrapper[disabled='true'] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	event-wrapper:last-of-type {
		margin-right: 0rem;
	}
</style>
