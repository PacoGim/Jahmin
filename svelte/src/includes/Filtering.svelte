<script lang="ts">
	import Filter from '../components/Filter.svelte'
	import { userSelectedTagsToGroup } from '../store/index.store'

	// let options = ['None', 'Artist', 'Album', 'AlbumArtist', 'Composer', 'Date', 'Genre']
</script>

<filtering-component>
	{#each $userSelectedTagsToGroup as filter, index (index)}
		<Filter filterType={filter} {index} />
	{/each}
</filtering-component>

<style>
	filtering-component {
		display: flex;
		flex-direction: row;
	}
</style>
