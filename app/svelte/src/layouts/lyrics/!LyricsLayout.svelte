<script lang="ts">
	import LyricsList from './LyricsList.svelte'
	import LyricHeader from './LyricHeader.svelte'
	import LyricsControls from './LyricsControls.svelte'
	import LyricsReadEdit from './LyricsReadEdit.svelte'
	import LyricsTextControls from './LyricsTextControls.svelte'
	import { config } from '../../stores/config.store'
	import { onMount } from 'svelte'
	import { playingSongStore } from '../../stores/main.store'
	import { onNewLyrics } from '../../stores/crosscall.store'
	import notifyService from '../../services/notify.service'
	import traduceFn from '../../functions/traduce.fn'

	let lyricsMode: 'Read' | 'Edit' = 'Read'

	let fontWeight = $config.userOptions.lyricsStyle.fontWeight
	let fontSize = $config.userOptions.lyricsStyle.fontSize
	let textAlignment = $config.userOptions.lyricsStyle.textAlignment

	let selectedLyrics = null

	let lyrics = ''

	let lyricList = []

	let isLyricsDirty = false

	let triggerTempLyricsChange = null

	function saveNewLyricValue() {
		window.ipc.saveLyrics(lyrics, selectedLyrics.title, selectedLyrics.artist).then(result => {
			if (result.code === 0) {
				notifyService.success(
					traduceFn('Lyrics for “${songTitle}” saved successfully!', {
						songTitle: result.data.title
					})
				)
				triggerTempLyricsChange = lyrics
			} else if (result.code === -1) {
				notifyService.error(traduceFn(result.message))
			}
		})
	}

	onMount(() => {
		window.ipc.getLyricsList().then(result => {
			lyricList = result

			let foundLyrics = undefined

			if ($onNewLyrics !== null) {
				lyricsMode = 'Edit'
				selectedLyrics = {
					title: $onNewLyrics.title,
					artist: $onNewLyrics.artist
				}
				foundLyrics = result.find(lyrics => lyrics.artist === $onNewLyrics.artist && lyrics.title === $onNewLyrics.title)

				onNewLyrics.set(null)
			} else {
				foundLyrics = result.find(
					lyrics => lyrics.artist === $playingSongStore.Artist && lyrics.title === $playingSongStore.Title
				)

				if (foundLyrics === undefined) {
					notifyService
						.question(
							traduceFn('No lyrics found for ${songTitle}. Would you like to create it?', {
								songTitle: $playingSongStore.Title
							})
						)
						.then(response => {
							if (response === true) {
								window.ipc.saveLyrics('', $playingSongStore.Title, $playingSongStore.Artist).then(result => {
									lyricList.push({
										artist: result.data.artist,
										title: result.data.title
									})

									lyricList = lyricList

									selectedLyrics = {
										artist: result.data.artist,
										title: result.data.title
									}
								})
							}
						})
				} else {
					selectedLyrics = {
						artist: $playingSongStore.Artist,
						title: $playingSongStore.Title
					}
				}
			}
		})
	})
</script>

<lyrics-layout class="layout">
	<LyricsList
		lyricsList={lyricList}
		selectedLyrics={selectedLyrics}
		on:selectedLyrics={({ detail }) => {
			selectedLyrics = detail
		}}
	/>

	<lyrics-body>
		<LyricHeader {selectedLyrics} {isLyricsDirty} />

		<lyrics-edit-mode-sign class={lyricsMode === 'Read' ? 'read' : 'edit'}>Edit Mode</lyrics-edit-mode-sign>

		<LyricsControls
			{lyricsMode}
			{isLyricsDirty}
			on:lyricsModeChange={res => (lyricsMode = res.detail)}
			on:saveLyrics={saveNewLyricValue}
		/>

		<LyricsTextControls
			{fontWeight}
			{fontSize}
			{textAlignment}
			on:fontWeightChange={({ detail }) => {
				fontWeight = detail
			}}
			on:fontSizeChange={({ detail }) => {
				fontSize = detail
			}}
			on:textAlignmentChange={({ detail }) => {
				textAlignment = detail
			}}
		/>

		<LyricsReadEdit
			on:newLyricValue={({ detail }) => {
				lyrics = detail
			}}
			on:lyricModeChange={({ detail }) => {
				lyricsMode = detail
			}}
			on:isLyricsDirty={({ detail }) => {
				isLyricsDirty = detail
			}}
			{triggerTempLyricsChange}
			{selectedLyrics}
			{lyricsMode}
			{fontWeight}
			{fontSize}
			{textAlignment}
		/>
	</lyrics-body>
</lyrics-layout>

<style>
	lyrics-layout {
		display: grid;

		grid-template-columns: max-content auto;
	}

	lyrics-body {
		display: grid;

		background: var(--color-bg-3);

		grid-template-columns: min-content auto auto;
		grid-template-rows: max-content max-content auto;

		overflow: hidden;

		grid-template-areas:
			'lyrics-name lyrics-name lyrics-name'
			'lyrics-edit-mode-sign lyrics-controls lyrics-read-edit-controls'
			'lyrics-read-edit lyrics-read-edit lyrics-read-edit';
	}

	lyrics-edit-mode-sign {
		grid-area: lyrics-edit-mode-sign;

		place-self: end;
		margin-left: 1rem;
		font-size: 0.85rem;

		justify-self: flex-start;

		padding: 0.5rem 0.75rem;
		font-variation-settings: 'wght' 600;

		width: fit-content;

		border-radius: 5px 5px 0 0;

		background-color: var(--color-accent-4);
		color: #fff;

		white-space: nowrap;

		transition-property: opacity, transform;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	lyrics-edit-mode-sign.read {
		opacity: 0;
		transform: translateY(calc(120% + 1rem));
	}

	lyrics-edit-mode-sign.edit {
		opacity: 1;
		transform: translateY(1rem);
	}
</style>
