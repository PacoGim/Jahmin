<script lang="ts">
	import LyricsList from './LyricsList.svelte'
	import LyricName from './LyricName.svelte'
	import LyricsControls from './LyricsControls.svelte'
	import LyricsReadEdit from './LyricsReadEdit.svelte'
	import LyricsReadEditControls from './LyricsReadEditControls.svelte'
	import { config } from '../../stores/config.store'
	import updateConfigFn from '../../functions/updateConfig.fn'
	import { onMount } from 'svelte'
	import notifyService from '../../services/notify.service'
	import iziToast from 'izitoast'
	import traduceFn from '../../functions/traduce.fn'
	import { playingSongStore } from '../../stores/main.store'

	let lyricsMode: 'Read' | 'Edit' = 'Read'

	let fontWeight = $config.userOptions.lyricsStyle.fontWeight
	let fontSize = $config.userOptions.lyricsStyle.fontSize
	let textAlignment = $config.userOptions.lyricsStyle.textAlignement

	let triggerLyricSave = undefined

	$: {
		console.log(triggerLyricSave)
	}

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

	onMount(() => {
		setTimeout(() => {
			notifyService
				.question(
					traduceFn('No lyrics found for ${songTitle}. Would you like to create it?', { songTitle: $playingSongStore.Title })
				)
				.then(response => {
					if (response === true) {
						window.ipc.saveLyrics('', $playingSongStore.Title, $playingSongStore.Artist).then(result => {
							console.log(result)
						})
					}
				})
		}, 1000)
	})
</script>

<lyrics-layout class="layout">
	<LyricsList />

	<lyrics-body>
		<LyricName />

		<lyrics-edit-mode-sign class={lyricsMode === 'Read' ? 'read' : 'edit'}>Edit Mode</lyrics-edit-mode-sign>

		<LyricsControls
			{lyricsMode}
			on:lyricsModeChange={res => (lyricsMode = res.detail)}
			on:saveLyrics={() => (triggerLyricSave = 'Ok')}
		/>

		<LyricsReadEditControls
			{fontWeight}
			{fontSize}
			{textAlignment}
			on:fontWeightChange={onFontWeightChange}
			on:fontSizeChange={onFontSizeChange}
			on:textAlignmentChange={onTextAlignmentChange}
		/>

		<LyricsReadEdit {lyricsMode} {fontWeight} {fontSize} {textAlignment} {triggerLyricSave} />
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

		grid-template-columns: max-content auto max-content;
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

		padding: 0.5rem 0.75rem;
		font-variation-settings: 'wght' 600;

		width: fit-content;

		border-radius: 5px 5px 0 0;

		background-color: var(--color-accent-4);
		color: #fff;

		transition-property: opacity transform;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	lyrics-edit-mode-sign.read {
		opacity: 0;
		transform: translateY(100%);
	}

	lyrics-edit-mode-sign.edit {
		opacity: 1;
		transform: translateY(2px);
	}
</style>
