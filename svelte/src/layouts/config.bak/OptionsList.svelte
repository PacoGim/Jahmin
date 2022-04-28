<script lang="ts">
	import { selectedOption, selectedOptionSection } from '../../store/final.store'

	let options = [
		{
			name: 'Looks',
			sections: [
				{
					name: 'Theme'
				},
				{
					name: 'Art Grid'
				},
				{
					name: 'Contrast Ratio'
				}
			]
		},
		{
			name: 'Equalizer',
			sections: [
				{
					name: 'Profiles'
				},
				{
					name: 'Configuration'
				}
			]
		},
		{
			name: 'Library',
			sections: [
				{
					name: 'Directories'
				}
			]
		}
	]
</script>

<option-list>
	{#each options as option, index (index)}
		<option-container>
			<option-name class={$selectedOption === option.name ? 'selected' : null} on:click={() => ($selectedOption = option.name)}
				>{option.name}</option-name
			>
			{#if option.sections}
				{#each option.sections as section, index (index)}
					<option-section class={$selectedOptionSection === section.name ? 'selected' : null}>{section.name}</option-section>
				{/each}
			{/if}
		</option-container>
	{/each}
</option-list>

<style>
	option-list {
		padding: 0.25rem;
		grid-area: options-list;
	}

	option-container {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;
	}

	option-name {
		font-size: 1rem;
		margin-bottom: 0.25rem;
		cursor: pointer;
	}
	option-name.selected {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}

	option-section {
		cursor: pointer;
		font-size: 0.9rem;
		margin-left: 1rem;
		margin-bottom: 0.25rem;
	}

	option-section.selected {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}
</style>
