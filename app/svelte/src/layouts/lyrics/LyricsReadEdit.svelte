<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher()

	export let lyricsMode

	export let fontWeight
	export let fontSize
	export let textAlignment

	export let selectedLyric = { title: '', artist: '' }

	export let triggerTempLyricsChange = null

	let lyrics = ''
	let tempLyrics = ''

	$: {
		if (triggerTempLyricsChange !== null) {
			tempLyrics = triggerTempLyricsChange
			triggerTempLyricsChange = null
		}
	}

	$: {
		dispatch('isLyricsDirty', lyrics !== tempLyrics)
	}

	$: {
		dispatch('newLyricValue', lyrics)
	}

	$: {
		getLyrics(selectedLyric.title, selectedLyric.artist)
	}

	function getLyrics(title: string, artist: string) {
		window.ipc.getLyrics(title, artist).then(result => {
			if (result.code === 0) {
				lyrics = result.data.lyrics
				dispatch('lyricModeChange', 'Read')
			} else {
				lyrics = ''
				dispatch('lyricModeChange', 'Edit')
			}
			tempLyrics = lyrics
		})
	}
</script>

<lyrics-read-edit class={lyricsMode === 'Read' ? 'read' : 'edit'}>
	<lyrics-text-area>
		<textarea
			style="text-align:{['left', 'center', 'right'][
				textAlignment
			]};font-size: {fontSize}px;line-height: {fontSize}px;font-variation-settings:'wght' {fontWeight};"
			bind:value={lyrics}
			disabled={lyricsMode === 'Read' ? true : false}
		/>
	</lyrics-text-area>
</lyrics-read-edit>

<style>
	lyrics-read-edit {
		display: flex;
		flex-direction: column;

		position: relative;

		grid-area: lyrics-read-edit;

		padding: 1rem;

		padding-top: 0;

		overflow-y: auto;
	}

	lyrics-text-area {
		width: 100%;
		height: 100%;

		margin-top: 1rem;

		position: relative;
	}

	textarea {
		width: 100%;
		height: 100%;

		resize: none;

		background-color: var(--color-bg-2);
		color: currentColor;

		border: none;

		border: 2px solid var(--color-accent-4);

		padding: 1rem;

		transition-property: border-color, font-size, line-height, font-variation-settings;
		transition-duration: 300ms, 100ms, 100ms, 100ms;
		transition-timing-function: linear;
	}

	textarea:disabled {
		border-color: transparent;
		background-color: var(--color-bg-2);
		color: currentColor;
	}
</style>
