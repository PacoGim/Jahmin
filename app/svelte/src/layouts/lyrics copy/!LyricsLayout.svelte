<script lang="ts">
	import LyricsRead from './LyricsRead.svelte'
	import LyricsEdit from './LyricsEdit.svelte'

	import EyeIcon from '../../icons/EyeIcon.svelte'
	import SaveIcon from '../../icons/SaveIcon.svelte'

	import UpdateIcon from '../../icons/UpdateIcon.svelte'
	import notifyService from '../../services/notify.service'

	import { keyModifier, keyPressed, playingSongStore, songLyricsSelected } from '../../stores/main.store'
	import LyricsList from './LyricsList.svelte'
	import { onNewLyrics } from '../../stores/crosscall.store'
	import { onMount } from 'svelte'
	import LyricsNotFound from './LyricsNotFound.svelte'
	import DeleteIcon from '../../icons/DeleteIcon.svelte'

	let lyrics
	let tempLyrics
	let selectedView: 'read' | 'edit' | 'notFound' = 'read'
	let triggerUpdateLyricsList = undefined

	$: if ($onNewLyrics !== null) showNewLyrics($onNewLyrics)

	$: isLyricsDirty = lyrics !== tempLyrics ? true : false

	$: if ($keyPressed === 's' && $keyModifier === 'ctrlKey') saveLyrics()

	$: if (selectedView === 'read') clearLyricsEdit()

	$: {
		$songLyricsSelected
		toggleNotFoundComponent()
	}

	function clearLyricsEdit() {
		if (isLyricsDirty === true) {
			isLyricsDirty = false

			tempLyrics = lyrics
		}
	}

	function showNewLyrics(newLyrics: { title: string; artist: string }) {
		$onNewLyrics = null

		$songLyricsSelected = newLyrics
		selectedView = 'edit'
	}

	function saveLyrics() {
		if (tempLyrics === lyrics) return

		lyrics = tempLyrics

		window.ipc
			.saveLyrics(lyrics, $songLyricsSelected.title, $songLyricsSelected.artist)
			.then(response => {
				triggerUpdateLyricsList = true
				isLyricsDirty = false

				setTimeout(() => {
					triggerUpdateLyricsList = undefined
				}, 500)
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}

	function onLyricsUpdate({ detail }) {
		tempLyrics = detail
	}

	function showLyrics({ detail }) {
		window.ipc
			.getLyrics(detail.title, detail.artist)
			.then(response => {
				lyrics = response || null
				tempLyrics = response || null
			})
			.catch(err => {
				notifyService.error(String(err))
			})
	}

	function toggleNotFoundComponent() {
		if (
			$songLyricsSelected === undefined ||
			$songLyricsSelected.artist === undefined ||
			$songLyricsSelected.title === undefined
		) {
			selectedView = 'notFound'
		} else {
			selectedView = 'read'
		}
	}

	function deleteLyrics() {
		window.ipc.deleteLyrics($songLyricsSelected.title, $songLyricsSelected.artist).then(response => {
			if (response.isError === true) {
				notifyService.error(response.message)
			} else {
				notifyService.success(response.message)
				triggerUpdateLyricsList = true

				if ($songLyricsSelected.artist === response.data.artist && $songLyricsSelected.title === response.data.title) {
					$songLyricsSelected = undefined
				}

				setTimeout(() => {
					triggerUpdateLyricsList = undefined
				}, 500)
			}
		})
	}
</script>

<lyrics-layout class="layout">
	<LyricsList on:show-lyrics={showLyrics} updateLyricsList={triggerUpdateLyricsList} />
	<lyrics-layout-header disabled={selectedView === 'notFound' ? 'true' : 'false'}>
		<song-information>
			{`${$songLyricsSelected?.title} by ${$songLyricsSelected?.artist}`}
			<span style="margin-left: 0.5rem;font-size: 1rem;">{isLyricsDirty ? '•' : ''}</span>
		</song-information>

		<lyrics-controls>
			<event-wrapper
				disabled={selectedView === 'read'}
				on:click={() => (selectedView = 'read')}
				on:keypress={() => (selectedView = 'read')}
				tabindex="-1"
				role="button"
			>
				<EyeIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper
				disabled={selectedView === 'edit'}
				on:click={() => (selectedView = 'edit')}
				on:keypress={() => (selectedView = 'edit')}
				tabindex="-1"
				role="button"
			>
				<UpdateIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper
				disabled={selectedView !== 'edit' || isLyricsDirty === false}
				on:click={() => saveLyrics()}
				on:keypress={() => saveLyrics()}
				tabindex="-1"
				role="button"
			>
				<SaveIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
			<event-wrapper on:click={() => deleteLyrics()} on:keypress={() => deleteLyrics()} tabindex="-1" role="button">
				<DeleteIcon style="height: 1.5rem;fill:var(--color-bg-1)" />
			</event-wrapper>
		</lyrics-controls>
	</lyrics-layout-header>

	<lyrics-layout-body>
		{#if selectedView === 'edit'}
			<LyricsEdit {lyrics} on:lyricsUpdate={onLyricsUpdate} />
		{:else if selectedView === 'read'}
			<LyricsRead {lyrics} />
		{:else if selectedView === 'notFound'}
			<LyricsNotFound />
		{/if}
	</lyrics-layout-body>
</lyrics-layout>

<style>
	lyrics-layout {
		height: 100%;
		display: grid;

		grid-template-areas:
			'lyrics-list lyrics-layout-header'
			'lyrics-list lyrics-layout-body';

		grid-template-rows: max-content auto;

		grid-template-columns: 1fr 4fr;
	}

	lyrics-layout-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;

		grid-area: lyrics-layout-header;
	}

	lyrics-layout-header[disabled='true'] {
		pointer-events: none;
		opacity: 0;
	}

	song-information {
		font-size: 1.5rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 150);
		display: flex;
	}

	lyrics-layout-body {
		display: block;
		overflow-x: hidden;
		overflow-y: auto;

		grid-area: lyrics-layout-body;
	}

	lyrics-controls {
		display: flex;
		flex-direction: row;

		justify-content: center;
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
