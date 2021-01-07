<script lang="ts">
	import { onMount } from 'svelte'

	import SongListItem from '../components/SongListItem.svelte'

	import { songList } from '../store/index.store'
	import { playlistIndex, selectedAlbum } from '../store/player.store'

	onMount(() => {
		// $playlistIndex = 1
		//TODO When song from album 1 ends and albums 2 songs were loaded (but not set to play) before end, the next song playing is from album 2. Possible fix, work with a store variable as playlist, Player Component has to work with both variables (Index + Playlist)
	})
</script>

<song-list-svlt>
	{#if $selectedAlbum !== undefined}
		{#if $selectedAlbum['Songs'] !== undefined}
			{#each $selectedAlbum['Songs'] as song, index (index)}
				<SongListItem albumID={$selectedAlbum['ID']} {song} {index} />
			{/each}
		{/if}
	{/if}

	<!-- {#if $songList !== undefined}
		{#each $songList as song, index (index)}
			<SongListItem {song} {index} />
		{/each}
	{/if} -->
</song-list-svlt>

<style>
	song-list-svlt {
		border: 10px transparent solid;
		grid-area: song-list-svlt;
		overflow-y: auto;
		height: 100%;
		/* background-color: rgba(255,255,255,.20); */
	}
</style>
