<script lang="ts">
	import Navigation from './includes/Navigation.svelte'
	import ArtGrid from './includes/ArtGrid.svelte'
	import Grouping from './includes/Ordering.svelte'
	import Player from './includes/Player.svelte'
	import SongList from './includes/SongList.svelte'
	import Details from './includes/Details.svelte'
	import Controller from './controller/Controller.svelte'
	import BackgroundArt from './includes/BackgroundArt.svelte'
</script>

<Controller />

<main>
	<Navigation />
	<ArtGrid />
	<Grouping />
	<Player />
	<SongList />
	<Details />
	<BackgroundArt />
</main>

<style>
	main {
		height: 100%;
		display: grid;
		grid-template-columns: 64px auto 8fr 256px;
		grid-template-rows: 2fr 1fr 64px;
		grid-template-areas:
			'navigation-svlt grouping-svlt art-grid-svlt details-svlt'
			'navigation-svlt grouping-svlt song-list-svlt details-svlt'
			'navigation-svlt player-svlt player-svlt player-svlt';
	}
</style>
