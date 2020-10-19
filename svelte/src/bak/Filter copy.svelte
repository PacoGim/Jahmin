<script lang="ts">
	import { onMount } from 'svelte'

	import { songIndex, allSongFilters } from '../store/index.store'

	export let index = undefined

	export let filterType = undefined
	let previousFilterType = undefined

	let previousUserSelect = undefined

	let selection = undefined

	$: {
		if (selection !== undefined) {
			updateFilters()
		}
	}

	function updateFilters() {
		if ($allSongFilters[index]?.['data']) {
			$allSongFilters[index] = { data: $allSongFilters[index]['data'], userSelection: selection, filter: filterType }
		} else {
			$allSongFilters[index] = { userSelection: selection, filter: filterType }
		}
	}

	// Genre -> AlbumArtist -> Date

	let currentArray = []

	function updateSongsArray() {
		// Gets the user selection of the previous category.
		const userSelection = $allSongFilters[index - 1]?.['userSelection'] || undefined
		// console.log($allSongFilters)

		// console.log(filterType, previousFilterType, previousUserSelect, userSelection)

		// If the Category or the user selection has changed (prevents re-running if no changes happened).
		if (previousFilterType !== filterType || previousUserSelect !== userSelection) {
			// Saves the current filter and user selection to check if it changed next time.
			previousFilterType = filterType
			previousUserSelect = userSelection

			// If the user did not select any option it doesn't bother filtering beyond what is required.
			if (userSelection === undefined) {
				let results = []

				// Iterates through all songs and keeps the ones with the choosen filter.
				$songIndex.forEach((song) => {
					// If that prevents redundant data.
					if (!results.includes(song[filterType])) {
						results.push(song[filterType])
					}
				})

				// Sets a sorted result.
				results = results.sort((a, b) => String(a).localeCompare(String(b)))

				// Saves the results in store.
				$allSongFilters[index] = { data: results, filter: filterType }

				// Sets the new data to the component array for-each.
				currentArray = $allSongFilters[index]['data']
			} else {
				// let previousCategoryType = $allSongFilters[index - 1]['filter']
				let tempArray=[]

				for (let i = 0; i < index; i++) {
					let filter = $allSongFilters[i]['filter']
					let selected = $allSongFilters[i]['userSelection']

					tempArray = $songIndex.filter((song) => song[filter] === selected)
				}

				let results=[]

				tempArray.forEach((song) => {
					// If that prevents redundant data.
					if (!results.includes(song[filterType])) {
						results.push(song[filterType])
					}
				})

				// Sets a sorted result.
				currentArray = results.sort((a, b) => String(a).localeCompare(String(b)))

				console.log('Three')
				console.log(filterType, userSelection, $allSongFilters[index - 1]['filter'])
			}
		} else {
			// console.log('Two')
			// console.log('Here')
			// currentArray = $allSongFilters[index]['data']
		}
	}

	$: {
		$allSongFilters
		updateSongsArray()
	}

	onMount(() => {})

	function cutWord(word) {
		try {
			if (word.length >= 20) {
				return word.substr(0, 18) + '...'
			} else {
				return word
			}
		} catch (error) {
			return word
		}
	}
</script>

<filter-component>
	{#each currentArray as item, index (index)}
		<item title={item}>
			<input type="radio" id="{item}{index}{filterType}" bind:group={selection} value={item} />
			<label for="{item}{index}{filterType}"> {cutWord(item)} </label>
		</item>
	{/each}
</filter-component>

<style>
	filter-component {
		display: flex;
		flex-direction: column;
	}

	item {
		display: flex;
		flex-direction: row;
		cursor: pointer;
	}

	item label {
		cursor: pointer;
	}

	item input[type='radio'] {
		display: none;
	}

	item input[type='radio']:checked + label {
		color: green;
		font-variation-settings: 'wght' 100;
	}

	item input[type='radio']:checked + label::before {
		content: '• ';
	}
</style>
