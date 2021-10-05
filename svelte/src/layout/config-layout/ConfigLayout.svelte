<script lang="ts">
	import { layoutToShow } from '../../store/final.store'

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

<config-layout class="layout" style="display:{$layoutToShow === 'Config' ? 'grid' : 'none'}">
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
		/* display: grid; */
		grid-template-columns: max-content auto;

		grid-template-areas: 'options-list selected-option';
	}
	config-layout selected-option{
		grid-area: selected-option;
	}
</style>
