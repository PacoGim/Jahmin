<script lang="ts">
	import { selectedOption } from '../../store/final.store'

	let options = [
		{
			name: 'Art Grid',
			sections: [
				{
					name: 'Set Art Size'
				},
				{
					name: 'Set Grid Gap'
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
		}
	]
</script>

<option-list>
	{#each options as option, index (index)}
		<option-container>
			<option-name on:click={() => ($selectedOption = option.name)}>{option.name}</option-name>
			{#if option.sections}
				{#each option.sections as section, index (index)}
					<option-section>{section.name}</option-section>
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

	option-section {
		cursor: pointer;
		font-size: 0.9rem;
		margin-left: 1rem;
		margin-bottom: 0.25rem;
	}
</style>
