<script lang="ts">
	import songListTagsVar from '../../../global/songListTags.var'
	import AddFillIcon from '../../../icons/AddFillIcon.svelte'
	import { songListTagsConfig } from '../../../store/config.store'
	import type { SelectedTagNameType } from '../../../types/selectedTag.type'

	let optionBind: SelectedTagNameType = 'Album'

	function addTag() {
		$songListTagsConfig.push({ value: optionBind, isExpanded: false, align: 'center' })
		$songListTagsConfig = $songListTagsConfig
	}

	function showOptionNameFromValue(value: string) {
		return songListTagsVar.find(option => option.value === value).name
	}
</script>

<add-song-list-tag>
	<tag-to-add>
		<selected-tag>{showOptionNameFromValue(optionBind)}</selected-tag>

		<select bind:value={optionBind}>
			{#each songListTagsVar as tag, index (index)}
				<option value={tag.value}>{tag.name}</option>
			{/each}
		</select>
	</tag-to-add>

	<tag-to-add-icon on:click={() => addTag()}>
		<AddFillIcon style="height: 2rem;width: 2rem;fill:var(--color-hl-gold);" />
	</tag-to-add-icon>
</add-song-list-tag>

<style>
	add-song-list-tag {
		display: flex;
		flex-direction: row;
		align-items: center;

		background-color: var(--color-bg-2);

		border-radius: 50px;
	}

	add-song-list-tag tag-to-add {
		display: grid;
		padding: 0 1rem;
	}

	add-song-list-tag selected-tag {
		grid-area: 1 / 1;
	}

	add-song-list-tag select {
		cursor: pointer;
		opacity: 0;
		grid-area: 1 / 1;
	}

	add-song-list-tag tag-to-add-icon {
		cursor: pointer;
		height: 2rem;
		width: 2rem;
	}
</style>
