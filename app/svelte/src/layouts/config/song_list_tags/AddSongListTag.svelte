<script lang="ts">
	import songListTagsVar from '../../../global/songListTags.var'
	import type { SelectedTagNameType } from '../../../../../types/selectedTag.type'
	import { songListTagConfig } from '../../../stores/config.store'

	let optionBind: SelectedTagNameType = 'ChooseTag'

	function addTag() {
		if ($songListTagConfig.find(tag => tag.value === optionBind) === undefined) {
			$songListTagConfig.push({ value: optionBind, isExpanded: false, align: 'center' })
			$songListTagConfig = $songListTagConfig
		}
		optionBind = 'ChooseTag'
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
				{#if !$songListTagConfig.find(item => item.value === tag.value)}
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
		justify-content: center;

		margin: 0 auto;
		color: #fff;

		width: fit-content;

		background-color: var(--color-accent-1);

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
