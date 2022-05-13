<script lang="ts">
	import { playbackStore } from '../../store/final.store'
</script>

{#each $playbackStore as song, index (index)}
	<p>{song.Track} - {song.Title}</p>
{/each}

<style>
</style>
