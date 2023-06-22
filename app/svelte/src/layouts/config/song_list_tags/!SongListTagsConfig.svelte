<script lang="ts">
	import { onMount } from 'svelte'
	import OptionSection from '../../../components/OptionSection.svelte'
	import { config } from '../../../stores/config.store'
	import type { SelectedTagType } from '../../../../../types/selectedTag.type'
	import AddSongListTag from './AddSongListTag.svelte'
	import SelectedTagList from './SelectedTagList.svelte'
	import SongListPreview from './SongListPreview.svelte'
	import updateConfigFn from '../../../functions/updateConfig.fn'

	let isMounted = false

	$: saveSelectedTagsToConfig($config.songListTags)

	function saveSelectedTagsToConfig(newSelectedTags: SelectedTagType[]) {
		if (isMounted === true) {
			updateConfigFn(
				{
					songListTags: newSelectedTags
				},
				{ doUpdateLocalConfig: false }
			)
		}
	}

	onMount(() => {
		isMounted = true
	})
</script>

<song-list-tag-config>
	<OptionSection title="Song List Tags">
		<AddSongListTag />

		<SelectedTagList />
	</OptionSection>

	<SongListPreview />
</song-list-tag-config>

<style>
	song-list-tag-config {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
