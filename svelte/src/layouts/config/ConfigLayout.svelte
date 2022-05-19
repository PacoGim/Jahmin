<script lang="ts">
	import { onMount } from 'svelte'

	import AppearanceConfig from './appearance/!AppearanceConfig.svelte'
	import EqualizerConfig from './equalizer/!EqualizerConfig.svelte'
	import LibraryConfig from './library/!LibraryConfig.svelte'
	import SongListTagsConfig from './song_list_tags/!SongListTagsConfig.svelte'

	const options = [
		{
			name: 'Appearance',
			component: AppearanceConfig
		},
		{
			name: 'Equalizer',
			component: EqualizerConfig
		},
		{
			name: 'Library',
			component: LibraryConfig
		},
		{
			name: 'Song List Tags',
			component: SongListTagsConfig
		}
	]

	let selectedOption = undefined
	let currentComponent = undefined

	function loadComponent(optionName: string) {
		let option = options.find(option => option.name === optionName)

		if (option.component && option.name) {
			currentComponent = option.component
			selectedOption = option.name

			sessionStorage.setItem('selectedConfigOptionName', option.name)
		}
	}

	onMount(() => {
		let selectedConfigOptionName = sessionStorage.getItem('selectedConfigOptionName') || 'Song List Tags'

		if (selectedConfigOptionName) {
			loadComponent(selectedConfigOptionName)
		}
	})
</script>

<config-layout-svlt>
	<options-list>
		{#each options as option, index (index)}
			<option-svlt data-selected={selectedOption === option.name} on:click={() => loadComponent(option.name)}
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
