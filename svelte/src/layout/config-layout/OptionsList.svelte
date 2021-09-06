<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatch = createEventDispatcher()

	let options = ['Equalizer', 'Art Grid', 'Song List', 'Song Info', 'Volume']
	let selectedOption

	$: {
		dispatch('optionSelected', selectedOption)
	}

	onMount(() => {
		selectedOption = 'Song List'
	})
</script>

<options-list>
	{#each options as option, index (index)}
		<option-radio>
			<input id="option-radio-{option}" type="radio" bind:group={selectedOption} value={option} />
			<label for="option-radio-{option}">{option}</label>
		</option-radio>
	{/each}
</options-list>

<style>
	option-radio {
		display: block;
	}

	option-radio label {
		cursor: pointer;
	}

	option-radio input {
		display: none;
	}

	options-list {
		grid-area: 'options-list';
	}
</style>
