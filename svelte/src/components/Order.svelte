<script lang="ts">
	import { onMount } from 'svelte'
	import { cutWord } from '../service/index.service'
	import { getConfig, getOrder } from '../service/ipc.service'
	import { versioning, valuesToFilter, valuesToGroup } from '../store/index.store'

	export let index
	export let group
	let config
	let orderedSongs = undefined
	let selection = undefined
	let isSelectionDirty = false

	$: {
		selection
		isSelectionDirty === true ? setFilterInStore() : (isSelectionDirty = true)
	}

	function setFilterInStore() {
		for (let i = 0; i < $valuesToGroup.length; i++) {
			if (i === index) {
				$valuesToFilter[i] = selection
			} else if ($valuesToFilter[i] === null || $valuesToFilter[i] === undefined) {
				$valuesToFilter[i] = null
			}
		}
	}

	$: {
		console.log($versioning)
		fetchSongs()
	}

	async function fetchSongs() {
		orderedSongs = await getOrder(index)
	}
	onMount(async () => {
		config = await getConfig()
		config = config?.['order']?.['grouping']?.[index]
	})
</script>

{#if orderedSongs}
	<order>
		<!-- <span>{config?.['order']?.['grouping']?.[index]} ({orderedSongs.length})</span> -->
		<item title="All {config}">
			<input type="radio" id="all{config}" bind:group={selection} value={null} />
			<label for="all{config}"> {config} ({orderedSongs.length}) </label>
		</item>
		{#each orderedSongs as item, index (index)}
			<item title={item}>
				<input type="radio" id="{item}{index}" bind:group={selection} value={item} />
				<label for="{item}{index}"> {cutWord(item, 20)} </label>
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
