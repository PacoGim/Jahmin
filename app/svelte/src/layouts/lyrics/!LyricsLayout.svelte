<script lang="ts">
	import LyricsList from './LyricsList.svelte'
	import LyricName from './LyricName.svelte'
	import LyricsCreate from './LyricsCreate.svelte'
	import LyricsControls from './LyricsControls.svelte'
	import LyricsReadEdit from './LyricsReadEdit.svelte'
	import LyricsReadEditControls from './LyricsReadEditControls.svelte'
	import { config } from '../../stores/config.store'
	import updateConfigFn from '../../functions/updateConfig.fn'

	let lyricsMode: 'Read' | 'Edit' = 'Edit'

	let fontWeight = $config.userOptions.lyricsStyle.fontWeight
	let fontSize = $config.userOptions.lyricsStyle.fontSize
	let textAlignment = $config.userOptions.lyricsStyle.textAlignement

	function onFontWeightChange({ detail }) {
		fontWeight = detail

		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					fontWeight
				}
			}
		})
	}

	function onFontSizeChange({ detail }) {
		fontSize = detail
		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					fontSize
				}
			}
		})
	}

	function onTextAlignmentChange({ detail }) {
		textAlignment = detail
		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					textAlignment
				}
			}
		})
	}
</script>

<lyrics-layout class="layout">
	<LyricsList />

	<lyrics-body>
		<LyricName />
		<LyricsCreate />
		<LyricsControls {lyricsMode} on:lyricsModeChange={res => (lyricsMode = res.detail)} />
		<LyricsReadEditControls
			{fontWeight}
			{fontSize}
			{textAlignment}
			on:fontWeightChange={onFontWeightChange}
			on:fontSizeChange={onFontSizeChange}
			on:textAlignmentChange={onTextAlignmentChange}
		/>
		<LyricsReadEdit {lyricsMode} {fontWeight} {fontSize} {textAlignment} />
	</lyrics-body>
</lyrics-layout>

<style>
	lyrics-layout {
		display: grid;

		grid-template-columns: 1fr 4fr;
	}

	lyrics-body {
		display: grid;

		grid-template-columns: auto max-content max-content;
		grid-template-rows: max-content max-content auto;

		overflow: hidden;

		grid-template-areas:
			'lyrics-name lyrics-name lyrics-create'
			'lyrics-controls lyrics-read-edit-controls lyrics-create'
			'lyrics-read-edit lyrics-read-edit lyrics-read-edit';
	}
</style>
