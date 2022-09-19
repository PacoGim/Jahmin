<script lang="ts">
	import { onMount } from 'svelte'
	import cssVariablesService from '../../services/cssVariables.service'
	import { groupSongs } from '../../services/groupSongs.service'
	import { config, dbSongsStore } from '../../stores/main.store'

	import ArtGrid from './ArtGrid.svelte'
	import NoSong from './NoSong.svelte'
	import SongList from './SongList.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import TagEdit from './TagEdit.svelte'
	import TagGroup from './TagGroup.svelte'

	$: if ($config.userOptions.fontSize !== undefined) {
		cssVariablesService.set('font-size', `${$config.userOptions.fontSize}px`)
	}

	onMount(() => {
		groupSongs($config.group.groupBy, $config.group.groupByValues)
	})
</script>

<library-layout class="layout">
	{#if $dbSongsStore.length > 0}
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
		grid-template-columns: auto auto 256px;
		/* grid-template-rows: auto minmax(auto, var(--song-list-svlt-height)); */
		/* grid-template-rows: auto clamp(160px, var(--song-list-svlt-height), var(--song-list-svlt-height)); */
		grid-template-rows: auto var(--song-list-svlt-height);
		grid-template-areas:
			'tag-group-svlt art-grid-svlt tag-edit-svlt'
			'tag-group-svlt song-list-svlt tag-edit-svlt';
	}
</style>
