<script lang="ts">
	import { onMount } from 'svelte'
	import cssVariablesService from '../../services/cssVariables.service'
	import { groupSongs } from '../../services/groupSongs.service'
	import { dbSongsStore } from '../../stores/main.store'
	import { config, fontSizeConfig } from '../../stores/config.store'

	import ArtGrid from './ArtGrid.svelte'
	import NoSong from './NoSong.svelte'
	import SongList from './SongList.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import TagEdit from './TagEdit.svelte'
	import TagGroup from './TagGroup.svelte'

	$: if ($fontSizeConfig !== undefined) {
		cssVariablesService.set('font-size', `${$fontSizeConfig}px`)
	}

	onMount(() => {})
</script>

<library-layout class="layout">
	{#if $dbSongsStore.length > 0 || true}
		<ArtGrid />
	{:else}
		<NoSong />
	{/if}
	<TagGroup />
	<SongList />
	<TagEdit />
	<SongListBackground />
</library-layout>

<style>
	library-layout {
		overflow-y: hidden;

		display: grid;
		grid-template-columns: max-content auto 256px;
		grid-template-rows: auto var(--song-list-svlt-height);
		grid-template-areas:
			'tag-group-svlt art-grid-svlt tag-edit-svlt'
			'tag-group-svlt song-list-svlt tag-edit-svlt';
	}
</style>
