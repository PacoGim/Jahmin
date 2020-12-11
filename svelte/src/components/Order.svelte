<script lang="ts">
	import { onMount } from 'svelte'
	import { cutWord } from '../service/index.service'
	import { getConfig, getOrder } from '../service/ipc.service'
	import { versioning, valuesToFilter, valuesToGroup, isValuesToFilterChanged, storeConfig } from '../store/index.store'

	export let index
	export let group
	let config
	let orderedSongs = []
	let selection = null
	let isSelectionChanged = false
	let isConfigLoading = true

	// $: {
	// 	selection
	// 	isSelectionChanged === true ? cleanFilters() : (isSelectionChanged = true)
	// }

	// $: {
	// 	$valuesToFilter
	// 	setSelection()
	// }

	// $: {
	// 	console.count()
	// 	console.log($valuesToFilter)
	// }

	$: if ($storeConfig !== undefined) {
		setSelectionFromConfigStore()
	}

	$: {
		selection
		if (isSelectionChanged) {
			cleanFilters()
		} else {
			isSelectionChanged = true
		}
	}

	function cleanFilters() {
		for (let i = index; i < $valuesToGroup.length; i++) {
			if (i === index) {
				$valuesToFilter[i] = selection
			} else {
				$valuesToFilter[i] = null
			}
		}

		console.log($valuesToFilter)
		$isValuesToFilterChanged = true
	}

	function setSelectionFromConfigStore() {
		selection = $storeConfig['order']['filtering'][index]
		$valuesToFilter[index] = selection
	}

	// // Only if the versioning is changed (when a filter/group is changed (Controller)), fetch songs.
	$: {
		console.log($versioning, ' Fetching songs')
		fetchSongs()
	}

	/*
		App loads.
			Gets config file filtering. <Object>
			Set app state with config file filtering. Store and Component.
			When user selects:
				Clear filters
				Save to config
				Update Store and Selection

	*/

	// Sets the selection when changed either from config file or the cleanFilters.
	function setSelection() {
		// console.count($valuesToGroup[index], index)
		selection = $valuesToFilter[index]
	}

	/*
	function cleanFilters() {
		// Do NOT save config if it is being loaded from the config file. Prevents sending/saving false data to config file.
		console.count(index)
		if (isConfigLoading === true) return

		// console.log('Filter Changed', index, $valuesToGroup[index])

		for (let i = 0; i < $valuesToGroup.length; i++) {
			// Sets undefined or empty string to null to get a full array.
			if (i === index) {
				$valuesToFilter[i] = selection
				// } else if (['Unknown', '', undefined, 'undefined', 'null', null].includes($valuesToFilter[i])) {
			} else if (['', undefined, 'undefined', 'null', null].includes($valuesToFilter[i])) {
				$valuesToFilter[i] = null
			} else if (i > index) {
				$valuesToFilter[i] = null
			}
		}
		// setSelection()

		// Triggers a save config in Controller.
		$isValuesToFilterChanged = true
	}
*/
	async function fetchSongs() {
		orderedSongs = await getOrder(index)
	}

	// onMount(async () => {
	// 	config = await getConfig()

	// 	if (config?.['order']?.['filtering']) {
	// 		// selection = config['order']['filtering'][index]
	// 		// $valuesToFilter[index] = config['order']['filtering'][index]
	// 	}

	// 	/* Gives time for the reactive statement to be registered, otherwise isConfigLoaded is set to false before
	// 	 the selection reactive statement exists.*/
	// 	setTimeout(() => (isConfigLoading = false), 100)
	// })
</script>

{#if orderedSongs}
	<order>
		<item title="All {group}">
			<input type="radio" id="all{group}" bind:group={selection} value={null} />
			<label for="all{group}"> {group} ({orderedSongs.length}) </label>
		</item>
		{#each orderedSongs as item, index (item['id'])}
			<item title={item['value']}>
				<input type="radio" id={item['id']} bind:group={selection} value={item['value']} />
				<label for={item['id']}> {cutWord(item['value'], 20)} </label>
			</item>
		{/each}
	</order>
{/if}

<style>
	order {
		display: flex;
		flex-direction: column;
	}
</style>
