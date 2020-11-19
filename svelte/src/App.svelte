<script lang="ts">
	import { songIndex } from './store/index.store'

	import { onMount } from 'svelte'

	import Navigation from './includes/Navigation.svelte'
	import ArtGrid from './includes/ArtGrid.svelte'
	import Grouping from './includes/Ordering.svelte'
	import Player from './includes/Player.svelte'
	import SongList from './includes/SongList.svelte'
	import Details from './includes/Details.svelte'
	import Controller from './includes/Controller.svelte'

	// const { ipcRenderer, shell } = require('electron')

	// onMount(() => {
	// 	ipcRenderer.invoke('get-songs').then((result) => {
	// 		// result = result.slice(0, 10)
	// 		console.log(result)
	// 		// $songIndex = result
	// 	})
	// })
</script>

<Controller />

<main>
	<!-- <Navigation /> -->
	<!-- <ArtGrid /> -->
	<Grouping />
	<!-- <Player /> -->
	<!-- <SongList /> -->
	<!-- <Details /> -->
</main>

<style>
	main {
		height: 100%;
		/* display: grid;
		grid-template-columns: 0.3fr 0.8fr 2.2fr 0.7fr;
		grid-template-rows: 1.9fr 0.9fr 0.2fr;
		grid-template-areas:
			'navigation-svlt grouping-svlt art-grid-svlt details-svlt'
			'navigation-svlt grouping-svlt song-list-svlt details-svlt'
			'navigation-svlt player-svlt player-svlt player-svlt'; */
	}
</style>
