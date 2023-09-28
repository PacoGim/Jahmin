<script lang="ts">
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import songListTagsVar from '../../../global/songListTags.var'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'

	import MoveIcon from '../../../icons/MoveIcon.svelte'
	import { songListTagConfig } from '../../../stores/config.store'

	export let tag
	export let index

	function getTagNameFromValue(value: string) {
		return songListTagsVar.find(tag => tag.value === value)?.name
	}

	function removeTagFromTagList(tagIndex: number) {
		let tagListCopy = [...$songListTagConfig]

		// Remove tag from config
		tagListCopy.splice(tagIndex, 1)

		if (tagListCopy.length === 0) {
			tagListCopy = [
				{
					value: 'Track',
					width: 100
				},
				{
					value: 'Title',
					width: 100
				},
				{
					value: 'PlayCount',
					width: 100
				},
				{
					value: 'Rating',
					width: 100
				},
				{
					value: 'Duration',
					width: 100
				}
			]
		}

		updateConfigFn({
			songListTags: tagListCopy
		})
	}
</script>

<!-- Center end start -->

<li data-index={index} data-align={tag.align} data-is-expanded={tag.isExpanded} data-value={tag.value}>
	<tag-name>{getTagNameFromValue(tag.value)}</tag-name>
	<select bind:value={$songListTagConfig[index].value}>
		{#each songListTagsVar as tag, index (index)}
			{#if !$songListTagConfig.find(item => item.value === tag.value)}
				<option value={tag.value}>{tag.name}</option>
			{/if}
		{/each}
	</select>
	<tag-empty-space />

	<move-icon>
		<MoveIcon style="height: 1.25rem;fill:var(--color-fg-1);margin:0 1rem;" />
	</move-icon>

	<delete-icon
		on:click={() => {
			removeTagFromTagList(index)
		}}
		on:keypress={() => {
			removeTagFromTagList(index)
		}}
		tabindex="-1"
		role="button"
	>
		<DeleteIcon style="height: 1.25rem;fill:var(--color-fg-1);" />
	</delete-icon>
</li>

<style>
	li {
		display: grid;
		align-items: center;
		grid-template-columns: max-content auto repeat(4, max-content);
		cursor: grab;
		padding: 0.5rem 1rem;
		margin: 1rem 0;
		background-color: var(--color-bg-2);
	}

	:global(li.slow-transition) {
		transition: transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	li:active {
		cursor: grabbing;
	}

	li tag-name {
		grid-area: 1 / 1;
		cursor: pointer;
		box-shadow: 0 1px 0 0px var(--color-fg-1);
		text-align: center;
	}

	li select {
		cursor: pointer;
		grid-area: 1 / 1;
		height: 100%;
		opacity: 0;
	}

	li tag-empty-space {
		display: block;
		height: 100%;
	}

	:where(li tag-aligns .tag-align label) {
		transition: transform 200ms ease-in-out;
	}

	li move-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	li delete-icon {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
