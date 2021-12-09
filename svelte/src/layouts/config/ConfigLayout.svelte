<script lang="ts">
	import {  selectedOption } from '../../store/final.store'
	import AppearanceOption from './looks-sections/ThemeConfig.svelte'

	import EqualizerOption from './options/EqualizerOption.svelte'
	import GroupsOption from './options/GroupsOption.svelte'
	import SongInfoOption from './options/SongInfoOption.svelte'
	import SongListOption from './options/SongListOption.svelte'
	import VolumeOption from './options/VolumeOption.svelte'
	import OptionsList from './OptionsList.svelte'
	import LooksOptions from './options/LooksOptions.svelte'
</script>

<config-layout class="layout">
	<OptionsList />
	<selected-option>
		{#if $selectedOption === 'Looks'}
			<LooksOptions />
		{:else if $selectedOption === 'Equalizer'}
			<EqualizerOption />
		{:else if $selectedOption === 'Groups'}
			<GroupsOption />
		{:else if $selectedOption === 'Appearance'}
			<AppearanceOption />
		{:else if $selectedOption === 'Song Info'}
			<SongInfoOption />
		{:else if $selectedOption === 'Song List'}
			<SongListOption />
		{:else if $selectedOption === 'Volume'}
			<VolumeOption />
		{/if}
	</selected-option>
</config-layout>

<style>
	config-layout {
		display: grid;

		grid-template-columns: max-content auto;

		grid-template-areas: 'options-list selected-option';
	}
	config-layout selected-option {
		grid-area: selected-option;
	}
</style>
