<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatch = createEventDispatcher()

	let options = ['Appearance', 'Groups', 'Equalizer', 'Art Grid', 'Song List', 'Song Info', 'Volume']
	let selectedOption

	$: {
		dispatch('optionSelected', selectedOption)
	}

	onMount(() => {
		selectedOption = 'Groups'
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
		/* display: block; */

		display: flex;
		align-items: center;
		padding: 0.25rem 0.5rem;
		background-color: var(--color-bg-2);
		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		margin: 0.1rem 0.05rem;
	}

	option-radio label {
		cursor: pointer;
	}

	option-radio input {
		display: none;
	}

	option-radio input + label::before {
		content: '•';
		opacity: 0;
		margin-right: 0.5rem;
	}

	option-radio input:checked + label::before {
		content: '•';
		opacity: 1;
		margin-right: 0.5rem;
	}

	options-list {
		grid-area: options-list;
	}
</style>
