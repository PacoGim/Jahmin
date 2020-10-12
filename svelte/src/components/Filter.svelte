<script lang="ts">
	import { onMount } from 'svelte'

	import { songIndex, allSongFilters } from '../store/index.store'

	export let index = undefined

	export let filterType = undefined
	let previousFilterType = undefined

	let previousUserSelect = undefined

	let selection = undefined

	$: {
		// console.log(selection)

		if (selection !== undefined) {
			if ($allSongFilters[index]?.['data']) {
				$allSongFilters[index] = { data: $allSongFilters[index]['data'], userSelection: selection }
			} else {
				$allSongFilters[index] = { userSelection: selection }
			}
		}
	}

	/*

    Genre -> AlbumArtist -> Date

  */

	let currentArray = []

	$: {
		// Gets the user selection of the previous category.
		let userSelection = $allSongFilters[index - 1]?.['userSelection'] || undefined

		// If the Category or the user selectino has changed (prevents re running if no changes happened).
		if (previousFilterType !== filterType || previousUserSelect !== userSelection) {
			previousFilterType = filterType
			previousUserSelect = userSelection

			if (userSelection === undefined) {
				let results = []

				$songIndex.forEach((song) => {
					if (!results.includes(song[filterType])) {
						results.push(song[filterType])
					}
				})

				results = results.sort((a, b) => String(a).localeCompare(String(b)))

				$allSongFilters[index] = { data: results }
				currentArray = $allSongFilters[index]['data']
			} else {
				console.log(filterType, userSelection)
			}
		} else {
			// console.log($allSongFilters)
			currentArray = $allSongFilters[index]['data']
		}
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
