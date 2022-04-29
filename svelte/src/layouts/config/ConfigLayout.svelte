<script lang="ts">
	import AppearanceConfig from './appearance/AppearanceConfig.svelte'
	import EqualizerConfig from './equalizer/EqualizerConfig.svelte'

	const options = [
		{
			name: 'Appearance',
			component: AppearanceConfig
		},
		{
			name: 'Equalizer',
			component: EqualizerConfig
		}
	]

	let selectedOption = options[0].name
	let currentComponent = options[0].component

	function updateSelectedOption(option: any) {
		selectedOption = option.name
		currentComponent = option.component
	}
</script>

<config-layout-svlt>
	<options-list>
		{#each options as option, index (index)}
			<option-svlt data-selected={selectedOption === option.name} on:click={() => updateSelectedOption(option)}
				>{option.name}</option-svlt
			>
		{/each}
	</options-list>

	<current-component-svlt>
		<svelte:component this={currentComponent} />
	</current-component-svlt>
</config-layout-svlt>

<style>
	config-layout-svlt {
		display: flex;
		flex-direction: row;
	}

	config-layout-svlt > options-list {
		display: flex;
		flex-direction: column;
	}

	config-layout-svlt > options-list > option-svlt {
		cursor: pointer;
		padding: 0.33rem 0.66rem;
		margin: 0.25rem;
		position: relative;
		box-shadow: inset 0 0px 0 0 transparent;

		transition-property: box-shadow background-color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}
	config-layout-svlt > options-list > option-svlt[data-selected='true'] {
		box-shadow: inset 0 -2px 0 0 var(--color-fg-1);
		background-color: var(--color-fg-1-low);
	}

	current-component-svlt {
		width: 100%;
		padding: 1rem;
	}
</style>
