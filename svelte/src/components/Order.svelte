<script lang="ts">
	import { onMount } from 'svelte'
	import { cutWord } from '../service/index.service'
	import { getOrder } from '../service/ipc.service'
	import { dbVersion, valuesToFilter, valuesToGroup, isValuesToFilterChanged, storeConfig } from '../store/index.store'

	export let index
	export let group
	let orderedSongs = []
	let selection = null
	let isSelectionChanged = false

	//TODO Try to make the selection come from local storage the first time the app runs and the value was set when playing song

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

		// console.log($valuesToFilter)
		$isValuesToFilterChanged = true
	}

	function setSelectionFromConfigStore() {
		selection = $storeConfig['order']['filtering'][index]
		$valuesToFilter[index] = selection
	}

	// Only if the dbVersion is changed (when a filter/group is changed (Controller)), fetch songs.
	$: {
		$dbVersion
		// console.log($dbVersion, ' Fetching songs')
		fetchSongs()
	}

	async function fetchSongs() {
		orderedSongs = await getOrder(index)
	}
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
		/* --highlight-color: #333; */
		--highlight-color: rgba(255, 255, 255, 0.25);

		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 100%;
		border-right: 1px rgba(255, 255, 255, 0.75) solid;
		padding: 0 1rem;
		font-size: 0.8rem;
	}

	order item label {
		border-radius: 5px;
		margin: 0.25rem 0;
		padding: 0 0.5rem;
		text-align: center;
	}
	order item:hover label {
		background-color: var(--highlight-color);
	}

	order item label {
		user-select: none;
		display: flex;
		align-items: center;
	}

	order item label {
		cursor: pointer;
	}

	order item input[type='radio'] {
		display: none;
	}

	order item input[type='radio'] + label::before {
		content: '●';
		font-size: 1.25rem;
		margin-right: 2px;
		opacity: 0;
	}
	order item input[type='radio']:checked + label {
		background-color: var(--highlight-color);
	}

	order item input[type='radio']:checked + label::before {
		content: '●';
		opacity: 1;
		margin-right: 2px;
	}
</style>
