<script lang="ts">
	import { onMount } from 'svelte'

	import SongListItem from '../components/SongListItem.svelte'

	import { songList } from '../store/index.store'
	import { songIndex } from '../store/player.store'

	onMount(() => {
		$songIndex = 1
	})
</script>

<song-list-svlt>
	{#if $songList !== undefined}
		{#each $songList as song, index (index)}
			<SongListItem {song} {index} />
		{/each}
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
