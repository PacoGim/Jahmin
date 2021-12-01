<script lang="ts">
	import { onMount } from 'svelte'

	import Album from '../../components/Album.svelte'
	import { artSizeConfig, gridGapConfig } from '../../store/config.store'
	import { albumListStore, selectedGroupByStore, selectedGroupByValueStore } from '../../store/final.store'

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)

	onMount(() => {
		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
		selectedGroupByStore.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})

		selectedGroupByValueStore.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})
	})
</script>

<art-grid-svlt>
	{#each $albumListStore as album (album.ID)}
		<Album {album} />
	{/each}
</art-grid-svlt>

<style>
	art-grid-svlt {
		padding: var(--grid-gap);

		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		grid-area: art-grid-svlt;

		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
	}
</style>
