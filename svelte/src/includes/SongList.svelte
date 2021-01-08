<script lang="ts">
	import SongListItem from '../components/SongListItem.svelte'

	import { selectedAlbum } from '../store/player.store'
</script>

<song-list-svlt>
	{#if $selectedAlbum !== undefined}
		{#if $selectedAlbum['Songs'] !== undefined}
			{#each $selectedAlbum['Songs'] as song, index (index)}
				<SongListItem albumID={$selectedAlbum['ID']} {song} {index} />
			{/each}
		{/if}
	{/if}
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
