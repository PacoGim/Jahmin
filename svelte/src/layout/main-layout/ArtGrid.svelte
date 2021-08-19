<script lang="ts">
	import { onMount } from 'svelte'

	import Album from '../../components/Album.svelte'
	import { albumArtSizeConfig } from '../../store/config.store'
	import { albumListStore, selectedGroupByStore, selectedGroupByValueStore } from '../../store/final.store'

	// If the album art size has been set in the store.
	$: if ($albumArtSizeConfig) document.documentElement.style.setProperty('--cover-dimension', `${$albumArtSizeConfig}px`)

	// $:console.log($albumListStore)

	// import { getAlbumsIPC } from '../service/ipc.service'


	// $: if ($storeConfig !== undefined) {
	// 	let dimension
	// 	try {
	// 		dimension = $storeConfig['art']['dimension']
	// 	} catch (error) {
	// 		dimension = 128
	// 	} finally {
	// 		document.documentElement.style.setProperty('--cover-dimension', `${dimension}px`)
	// 	}
	// }

	// $: {
	// 	let groupOnlyByFolder = $storeConfig?.userOptions?.groupOnlyByFolder
	// 	if (groupOnlyByFolder!==undefined) {
	// 		fetchSongs(groupOnlyByFolder)
	// 	}
	// }

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
		/* justify-content: space-evenly; */
		padding: 1rem;
		/* justify-content: space-evenly; */
		/* padding: 1rem; */
		/* padding: var(--art-grid-gap); */
		/* border-bottom: 1rem solid transparent; */
		/* border-bottom: var(--art-grid-gap) solid transparent; */
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		grid-area: art-grid-svlt;
		border-right: 10px transparent solid;
		/* grid-template-columns: repeat(auto-fit, var(--cover-dimension)); */
		/* grid-template-rows: repeat(auto-fit, var(--cover-dimension));	 */
		/* display: grid;
		gap: var(--art-grid-gap); */
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
	}
</style>
