<script lang="ts">
	import Filter from '../components/Filter.svelte'

	import { songIndex, allSongFilters } from '../store/index.store'
	import { onMount } from 'svelte'

	let options = ['None', 'Artist', 'Album', 'AlbumArtist', 'Composer', 'Date', 'Genre']

	// let filters = ['Genre', 'AlbumArtist', 'Date']
	// let filters = ['Genre', 'AlbumArtist', 'Composer','Artist']
	let filters = ['Genre', 'AlbumArtist']

	onMount(() => {})
</script>

<filtering-component>
	{#each filters as filter, index (index)}
		<Filter filterType={filter} {index} />
	{/each}
</filtering-component>

<style>
	filtering-component {
		display: flex;
		flex-direction: row;
	}
</style>
