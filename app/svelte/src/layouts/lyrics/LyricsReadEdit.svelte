<script lang="ts">
	import { playingSongStore } from '../../stores/main.store'

	export let lyricsMode

	export let fontWeight
	export let fontSize
	export let textAlignment

	export let triggerLyricSave

	$: {
		if (triggerLyricSave !== undefined) {
			triggerLyricSave = undefined
			window.ipc.saveLyrics(lyric, $playingSongStore.Title, $playingSongStore.Artist).then(result => {
				console.log(result)
			})
		}
	}

	let lyric = 'Add a new lyrics bla bla bla'
</script>

<lyrics-read-edit class={lyricsMode === 'Read' ? 'read' : 'edit'}>
	<lyrics-text-area>
		<textarea
			style="text-align:{['left', 'center', 'right'][
				textAlignment
			]};font-size: {fontSize}px;line-height: {fontSize}px;font-variation-settings:'wght' {fontWeight};"
			value={lyric}
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
