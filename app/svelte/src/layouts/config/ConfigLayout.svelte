<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { onMount } from 'svelte'

	import { selectedConfigOptionName } from '../../stores/session.store'

	import AppearanceConfig from './appearance/!AppearanceConfig.svelte'
	import EqualizerConfig from './equalizer/!EqualizerConfig.svelte'
	import LibraryConfig from './library/!LibraryConfig.svelte'
	import SongListTagsConfig from './song_list_tags/!SongListTagsConfig.svelte'

	const options: {
		name: 'Appearance' | 'Equalizer' | 'Library' | 'Song List Tags'
		component: any
	}[] = [
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

			$selectedConfigOptionName = option.name
		}
	}

	onMount(() => {
		loadComponent($selectedConfigOptionName)
	})
</script>

<config-layout-svlt>
	<options-list class="smooth-colors">
		{#each options as option, index (index)}
			<option-svlt
				class="smooth-colors"
				data-selected={selectedOption === option.name}
				on:click={() => loadComponent(option.name)}>{option.name}</option-svlt
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
		height: inherit;
	}

	config-layout-svlt > options-list {
		display: flex;
		flex-direction: column;
		width: 200px;

		font-size: 1.05rem;
		font-variation-settings: 'wght' 650;

		text-shadow: none;

		border-right: 2px solid var(--color-bg-3);

		background-color: var(--color-bg-2);
	}

	config-layout-svlt > options-list > option-svlt {
		cursor: pointer;
		padding: 0.33rem 0.66rem;
		padding-left: 2rem;
		margin: 0.25rem;
		position: relative;
		box-shadow: inset 0 0px 0 0 transparent;

		position: relative;

		color: var(--color-fg-2);
	}

	config-layout-svlt > options-list > option-svlt:hover {
		color: var(--color-fg-1);
	}
	config-layout-svlt > options-list > option-svlt::before {
		content: '▶';
		position: absolute;

		transform: scale(0);
		left: 5px;
		color: var(--color-fg-1);
		opacity: 0;

		transition-property: transform, opacity, color;
		transition-duration: 300ms, 300ms, var(--theme-transition-duration);
		transition-timing-function: cubic-bezier(0.4, -0.4, 0.4, 1.4), cubic-bezier(0.4, -0.4, 0.4, 1.4), linear;
	}

	config-layout-svlt > options-list > option-svlt[data-selected='true']::before {
		content: '▶';
		transform: scale(0.75);
		opacity: 1;
	}

	config-layout-svlt > options-list > option-svlt[data-selected='true'] {
		color: var(--color-fg-1);
	}

	current-component-svlt {
		width: 100%;
		padding: 1rem;
	}
</style>
