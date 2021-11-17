<script lang="ts">
	import AlbumInfo from './AlbumInfo.svelte'
	import ArtGrid from './ArtGrid.svelte'
	import Grouping from './Grouping.svelte'
	import Navigation from './Navigation.svelte'
	import Player from './player/Player.svelte'
	import SongInfo from './SongInfo.svelte'
	import SongList from './SongList.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import TagEdit from './TagEdit.svelte'
</script>

<main-layout>
	<Navigation />
	<ArtGrid />
	<Grouping />
	<Player />
	<SongList />
	<TagEdit />
	<SongInfo />
	<SongListBackground />
	<AlbumInfo />
</main-layout>

<style>
	main-layout {
		height: 100%;
		overflow-y: hidden;
		display: grid;
		grid-template-columns: 64px auto 3fr 256px;
		grid-template-rows: auto minmax(auto, var(--song-list-svlt-height)) 64px;
		grid-template-areas:
			'navigation-svlt grouping-svlt art-grid-svlt tag-edit-svlt'
			'navigation-svlt grouping-svlt song-list-svlt tag-edit-svlt'
			'song-info-svlt song-info-svlt player-svlt album-info-svlt';
	}
</style>
