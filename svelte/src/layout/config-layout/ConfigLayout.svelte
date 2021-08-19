<script>
	import { showConfigLayout } from '../../store/final.store'

	import Navigation from '../main-layout/Navigation.svelte'
	import ArtGridOption from './options/ArtGridOption.svelte'
	import EqualizerOption from './options/EqualizerOption.svelte'
	import SongInfoOption from './options/SongInfoOption.svelte'
	import SongListOption from './options/SongListOption.svelte'
	import VolumeOption from './options/VolumeOption.svelte'
	import OptionsList from './OptionsList.svelte'

	let selectedOption = undefined

	function handleOptionSelected(response) {
		selectedOption = response.detail
	}
</script>

<config-layout style="opacity:{$showConfigLayout === true ? '1' : '0'}">
	<Navigation />
	<OptionsList on:optionSelected={handleOptionSelected} />
	<selected-option>
		{#if selectedOption === 'Art Grid'}
			<ArtGridOption />
		{:else if selectedOption === 'Equalizer'}
			<EqualizerOption />
		{:else if selectedOption === 'Song Info'}
			<SongInfoOption />
		{:else if selectedOption === 'Song List'}
			<SongListOption />
		{:else if selectedOption === 'Volume'}
			<VolumeOption />
		{/if}
	</selected-option>
</config-layout>

<style>
	config-layout {
		position: fixed;
		top: 0;
		left: 0;
		height: calc(100% - 64px);
		width: 100%;

		background-color: var(--secondary-color);

		grid-template-columns: 64px max-content auto;
		overflow-y: hidden;
		display: grid;
		z-index: 10;

		grid-template-areas: 'navigation-svlt options-list selected-option';

		transition: opacity 300ms ease-in-out;
	}
</style>
