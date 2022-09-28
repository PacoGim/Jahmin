<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatcher = createEventDispatcher()

	export let lyrics

	let lyricsEdit: HTMLElement

	let lyricsText = ''

	$: if (lyrics) lyricsText = lyrics

	function lyricsUpdate() {
		dispatcher('lyricsUpdate', lyricsText)
	}

	onMount(() => {
		lyricsEdit.focus()
	})
</script>

<textarea bind:value={lyricsText} on:input={() => lyricsUpdate()} bind:this={lyricsEdit} />

<style>
	textarea {
		background-color: var(--color-bg-1);
		color: var(--color-fg-1);
		font-family: inherit;
		font-size: inherit;
		resize: none;
		width: calc(100% - 2rem);
		height: calc(100% - 2rem);
		padding: 1rem;
		outline: none;
		margin: 1rem;
	}
</style>
