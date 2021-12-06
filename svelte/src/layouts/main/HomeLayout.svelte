<script lang="ts">
	import { onMount } from 'svelte'
	import { groupSongsIPC } from '../../services/ipc.service'
	import { groupByConfig, groupByValuesConfig } from '../../store/config.store'

	import ArtGrid from './ArtGrid.svelte'

	import SongList from './SongList.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import TagEdit from './TagEdit.svelte'
	import TagGroup from './TagGroup.svelte'

	onMount(() => {
		groupSongsIPC($groupByConfig, $groupByValuesConfig)
	})
</script>

<home-layout class="layout">
	<ArtGrid />
	<TagGroup />
	<SongList />
	<TagEdit />
	<SongListBackground />
</home-layout>

<style>
	home-layout {
		overflow-y: hidden;

		display: grid;
		grid-template-columns: auto 3fr 256px;
		grid-template-rows: auto minmax(auto, var(--song-list-svlt-height));
		grid-template-areas:
			'tag-group-svlt art-grid-svlt tag-edit-svlt'
			'tag-group-svlt song-list-svlt tag-edit-svlt';
	}
</style>
