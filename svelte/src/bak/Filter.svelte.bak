<script lang="ts">
	import { cutWord } from '../helpers/index.helper'
	import { filterSongs } from '../helpers/songFilter.helper'
	import { userSelectedTagsToGroup, userSelectedValueToFilter } from '../store/index.store'

	export let index = undefined
	export let filterType = undefined

	let currentArray = []

	$: {
		currentArray = filterSongs($userSelectedTagsToGroup, $userSelectedValueToFilter, index)
	}
</script>

<filter-component>
	<item title="All {filterType}">
		<input type="radio" id="all{filterType}" bind:group={$userSelectedValueToFilter[index]} value={undefined} />
		<label for="all{filterType}"> {filterType} ({currentArray.length}) </label>
	</item>
	{#each currentArray as item, i (i)}
		<item title={item}>
			<input type="radio" id="{item}{i}{filterType}" bind:group={$userSelectedValueToFilter[index]} value={item} />

			{#if item && item[filterType] !== undefined}
				<label for="{item}{i}{filterType}"> {cutWord(item[filterType])} </label>
			{:else}
				<label for="{item}{i}{filterType}"> {cutWord(item)} </label>
			{/if}
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
