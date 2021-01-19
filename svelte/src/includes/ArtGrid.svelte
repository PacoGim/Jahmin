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
		getAlbums().then(() => {
			scrollToLastAlbumPlayed()
			// calculateGridGap()
		})

		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined
		isValuesToFilterChanged.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})

		// window.addEventListener('resize', () => calculateGridGap())
	})

	function scrollToLastAlbumPlayed() {
		let lastPlayedAlbumID = localStorage.getItem('LastPlayedAlbumID') || undefined

		if (lastPlayedAlbumID) {
			let $album = document.querySelector(`#${CSS.escape(lastPlayedAlbumID)}`)

			if ($album) {
				$album.scrollIntoView()
			}
		}
	}

	function calculateGridGap() {
		const configDimension = $storeConfig?.['art']?.['dimension']
		let $artGridSvltWidth = document.querySelector('art-grid-svlt').getBoundingClientRect()['width']

		if (configDimension) {
			console.log('------------------')
			// let gridGap = ($artGridSvltWidth % configDimension) / ($artGridSvltWidth / configDimension)

			let amountToFit = Math.floor($artGridSvltWidth / configDimension)
			let gridGap = $artGridSvltWidth / amountToFit - configDimension

			console.log(gridGap)

			// if (gridGap < 16) gridGap = 16

			document.documentElement.style.setProperty('--art-grid-gap', `${gridGap}px`)
		}
	}
</script>

<art-grid-svlt>
	{#each $albums as album, index (album['ID'])}
		<Album {album} {index} />
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
		background-color: rgba(0, 0, 0, 0.3);
		/* display: grid;
		grid-template-columns: repeat(auto-fit, var(--cover-dimension));
		grid-template-rows: repeat(auto-fit, var(--cover-dimension));
		gap: var(--art-grid-gap); */
		display: flex;
		flex-wrap: wrap;
	}
</style>
