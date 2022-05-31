<script lang="ts">
	import { onMount } from 'svelte'
	import { groupSongs } from '../../services/groupSongs.service'
	import { fontSizeConfig, groupByConfig, groupByValuesConfig } from '../../store/config.store'

	import ArtGrid from './ArtGrid.svelte'

	import SongList from './SongList.svelte'
	import SongListBackground from './SongListBackground.svelte'
	import TagEdit from './TagEdit.svelte'
	import TagGroup from './TagGroup.svelte'

	$: if ($fontSizeConfig !== undefined) document.documentElement.style.setProperty('--font-size', `${$fontSizeConfig}px`)

	onMount(() => {
		groupSongs($groupByConfig, $groupByValuesConfig)
	})
</script>

<library-layout class="layout">
	<ArtGrid />
	<TagGroup />
	<SongList />
	<TagEdit />
	<SongListBackground />
</library-layout>

<style>
	library-layout {
		overflow-y: hidden;

		display: grid;
		grid-template-columns: auto 3fr 256px;
		/* grid-template-rows: auto minmax(auto, var(--song-list-svlt-height)); */
		/* grid-template-rows: auto clamp(160px, var(--song-list-svlt-height), var(--song-list-svlt-height)); */
		grid-template-rows: auto var(--song-list-svlt-height);
		grid-template-areas:
			'tag-group-svlt art-grid-svlt tag-edit-svlt'
			'tag-group-svlt song-list-svlt tag-edit-svlt';
	}
</style>
