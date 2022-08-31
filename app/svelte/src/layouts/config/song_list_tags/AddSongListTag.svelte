<script lang="ts">
	import songListTagsVar from '../../../global/songListTags.var'
	import { config, songListTagsValuesStore } from '../../../stores/main.store'
	import type { SelectedTagNameType } from '../../../../../types/selectedTag.type'

	let optionBind: SelectedTagNameType = 'ChooseTag'

	function addTag() {
		if ($config.songListTags.find(tag => tag.value === optionBind) === undefined) {
			$config.songListTags.push({ value: optionBind, isExpanded: false, align: 'center' })
			$config.songListTags = $config.songListTags
		}
	}

	function getOptionNameFromValue(value: string) {
		if (value === 'ChooseTag') {
			return 'Choose tag to add'
		}

		return songListTagsVar.find(option => option.value === value).name
	}
</script>

<add-song-list-tag>
	<tag-to-add>
		<selected-tag>{getOptionNameFromValue(optionBind)}</selected-tag>

		<select bind:value={optionBind} on:change={() => addTag()}>
			<option value="ChooseTag" disabled>Choose tag to add</option>
			{#each songListTagsVar as tag, index (index)}
				{#if !$songListTagsValuesStore.includes(tag.value)}
					<option value={tag.value}>{tag.name}</option>
				{/if}
			{/each}
		</select>
	</tag-to-add>
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
		align-items: center;
	}

	add-song-list-tag selected-tag {
		grid-area: 1 / 1;
		text-align: center;
	}

	add-song-list-tag select {
		cursor: pointer;
		opacity: 0;
		grid-area: 1 / 1;
		padding: 0.5rem 1rem;
	}
</style>
