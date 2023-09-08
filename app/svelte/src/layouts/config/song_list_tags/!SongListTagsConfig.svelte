<script lang="ts">
	import { onMount } from 'svelte'
	import OptionSection from '../../../components/OptionSection.svelte'
	import type { SelectedTagType } from '../../../../../types/selectedTag.type'
	import AddSongListTag from './AddSongListTag.svelte'
	import SelectedTagList from './SelectedTagList.svelte'
	import SongListPreview from './SongListPreview.svelte'
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import { songListTagConfig } from '../../../stores/config.store'
	import type { ConfigType } from '../../../../../types/config.type'

	let isMounted = false

	$: saveSelectedTagsToConfig($songListTagConfig)

	function saveSelectedTagsToConfig(newSelectedTags: ConfigType['songListTags']) {
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
