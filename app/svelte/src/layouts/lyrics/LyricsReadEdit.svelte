<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import traduceFn from '../../functions/traduce.fn'

	let dispatch = createEventDispatcher()

	export let lyricsMode: 'Read' | 'Edit' | 'Disabled'

	export let fontWeight
	export let fontSize
	export let textAlignment

	export let selectedLyrics = null

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
		if (selectedLyrics !== null) {
			getLyrics(selectedLyrics.title, selectedLyrics.artist)
		}
	}

	function getLyrics(title: string, artist: string) {
		window.ipc.getLyrics(title, artist).then(result => {
			if (result.code === 0) {
				lyrics = result.data.lyrics

				if (lyrics === '') {
					dispatch('lyricModeChange', 'Edit')
				} else {
					dispatch('lyricModeChange', 'Read')
				}
			}
			tempLyrics = lyrics
		})
	}
</script>

<lyrics-read-edit class={lyricsMode.toLowerCase()}>
	<lyrics-text-area>
		{#if lyricsMode !== 'Disabled'}
			<!-- ▼▼▼▼▼▼▼▼▼▼ If the lyrics mode is not Disabled (Lyrics selected) ▼▼▼▼▼▼▼▼▼▼ -->
			<textarea
				style="text-align:{['left', 'center', 'right'][textAlignment]};font-size: {fontSize}px;line-height: {fontSize +
					8}px;font-variation-settings:'wght' {fontWeight};"
				bind:value={lyrics}
				disabled={lyricsMode === 'Read' ? true : false}
			/>
			<!-- ▲▲▲▲▲▲▲▲▲▲ If the lyrics mode is not Disabled (Lyrics selected) ▲▲▲▲▲▲▲▲▲▲ -->
		{:else if lyricsMode === 'Disabled'}
			<!-- ▼▼▼▼▼▼▼▼▼▼ If the lyrics mode is disabled (No lyrics selected) ▼▼▼▼▼▼▼▼▼▼ -->

			<no-lyrics-selected>
				<container>
					<container-header>{traduceFn('No lyrics selected')}</container-header>

					<container-body>
						<p>{traduceFn('You can select lyrics on the left panel')}</p>
						<p>
							{@html traduceFn(
								"If you don't have any lyrics yet, you can right click a song and click on <bold>Show/Edit Lyrics</bold>"
							)}
						</p>
					</container-body>
				</container>
			</no-lyrics-selected>

			<!-- ▲▲▲▲▲▲▲▲▲▲ If the lyrics mode is disabled (No lyrics selected) ▲▲▲▲▲▲▲▲▲▲ -->
		{/if}
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

	no-lyrics-selected {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 50%;
	}
	no-lyrics-selected container {
		width: 400px;
		padding: 1rem;
		background-color: var(--color-bg-2);
		/* background: linear-gradient(to bottom right, #deefff, var(--color-bg-2)); */
		border-radius: 5px;
		/* border: 2px solid var(--color-bg-3); */
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1); /* x | y | blur | spread | color */
	}

	no-lyrics-selected container > * {
		display: block;
	}

	no-lyrics-selected container container-header {
		font-variation-settings: 'wght' 700;
		color: var(--color-accent-2);
	}

	no-lyrics-selected container container-body {
		font-variation-settings: 'wght' 600;
		margin: 1rem;
	}

	no-lyrics-selected container container-body p:first-of-type {
		margin-bottom: 0.5rem;
	}
</style>
