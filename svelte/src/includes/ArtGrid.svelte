<script lang="ts">
	import { onMount } from 'svelte'
	import Album from '../components/Album.svelte'

	import { getAlbums } from '../service/ipc.service'

	import { albums, isValuesToFilterChanged, storeConfig } from '../store/index.store'

	$: if ($storeConfig !== undefined) {
		let dimension
		try {
			dimension = $storeConfig['art']['dimension']
		} catch (error) {
			dimension = 128
		} finally {
			document.documentElement.style.setProperty('--cover-dimension', `${dimension}px`)
		}
	}

	//TODO Change gradient
	onMount(() => {
		// Calls the IPC once to wait for the filtering to be done.
		getAlbums().then(() => scrollToLastAlbumPlayed())

		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined
		isValuesToFilterChanged.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})
	})

	function scrollToLastAlbumPlayed() {
		let lastAlbumPlayedID = localStorage.getItem('LastAlbumPlayedID') || undefined

		if (lastAlbumPlayedID) {
			let $album = document.querySelector(`#${lastAlbumPlayedID}`)

			if ($album) {
				$album.scrollIntoView({ behavior: 'smooth' })
			}
		}
	}
</script>

<!-- <art-grid-svlt on:scroll={() => saveScrollPosition()}> -->
<art-grid-svlt>
	{#each $albums as album, index (album['ID'])}
		<Album {album} {index} />
	{/each}
</art-grid-svlt>

<style>
	art-grid-svlt {
		border: 1rem transparent solid;
		overflow-y: auto;
		height: 100%;
		grid-area: art-grid-svlt;
		background-color: rgba(0, 0, 0, 0.3);
		display: grid;
		grid-template-columns: repeat(auto-fit, var(--cover-dimension));
		grid-template-rows: repeat(auto-fit, var(--cover-dimension));
		gap: 1rem;
	}
</style>
