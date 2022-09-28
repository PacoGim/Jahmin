<script lang="ts">
	import parseLyricsFn from '../../functions/parseLyrics.fn'

	export let lyrics

	let lyricsContainer: HTMLElement

	$: if (lyrics && lyricsContainer) parseLyricsFn(lyrics, lyricsContainer)
</script>

<lyrics-container bind:this={lyricsContainer} />

<style>
	lyrics-container {
		display: block;
		margin: 1rem;
		overflow-y: scroll;
	}

	:global(lyrics-container p) {
		font-size: 1.25rem;
		line-height: normal;
	}
</style>
