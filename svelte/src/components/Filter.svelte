<script>
	import { songIndex } from '../store/index.store'

	// let groupBy = ['Genre']
	let genres = []
	let firstFilter = []
	let finalFilter = []
	// let filterBy = 'Genre'
	let filterBy = ['Genre', 'Artist']

	// $: {
	// 	firstFilter = []
	// 	$songIndex.forEach((song) => {
	// 		if (!firstFilter.includes(song[filterBy])) {
	// 			firstFilter.push(song[filterBy])
	// 			firstFilter = firstFilter.sort((a, b) => {
	// 				return String(a).localeCompare(String(b))
	// 			})
	// 		}
	// 	})
	// }

	function showFilteredSongs(filter) {
		finalFilter = []
		$songIndex.forEach((song) => {
			if (song[filterBy] === filter) {
				finalFilter.push(song)
				finalFilter = finalFilter
			}
		})
	}

	function filterArray() {}

	let options = ['Artist', 'Album', 'AlbumArtist', 'Year', 'Genre', 'Composer']
</script>

<select bind:value={filterBy}>
	<option value="Genre">Genre</option>
	<option value="Artist">Artist</option>
</select>

<div>
	<first-filter>
		{#each firstFilter as filter, index (index)}
			<p on:click={() => showFilteredSongs(filter)}>{filter}</p>
		{/each}
	</first-filter>
</div>

<style>
	div {
		display: flex;
		flex-direction: row;
	}
</style>
