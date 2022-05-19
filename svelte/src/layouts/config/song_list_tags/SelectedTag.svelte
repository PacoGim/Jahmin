<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import songListTagsVar from '../../../global/songListTags.var'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'

	const dispatch = createEventDispatcher()

	import MoveIcon from '../../../icons/MoveIcon.svelte'
	import { songListTagsConfig } from '../../../store/config.store'

	export let tag
	export let index

	function getTagNameFromValue(value: string) {
		return songListTagsVar.find(tag => tag.value === value).name
	}

	function removeTagFromTagList(tagIndex: number) {
		$songListTagsConfig.splice(tagIndex, 1)
		$songListTagsConfig = $songListTagsConfig
	}
</script>

<selected-tag-component
	draggable
	data-index={index}
	on:dragover={evt => evt.preventDefault()}
	on:dragstart={evt => {
		dispatch('dragStart', evt)
	}}
	on:drop={evt => {
		dispatch('dragDrop', evt)
	}}
>
	<tag-name>{getTagNameFromValue(tag.value)}</tag-name>
	<select bind:value={$songListTagsConfig[index].value}>
		{#each songListTagsVar as tag, index (index)}
			<option value={tag.value}>{tag.name}</option>
		{/each}
	</select>
	<tag-empty-space />
	<tag-expand data-is-expanded={$songListTagsConfig[index].isExpanded}>
		<input id="{index}-{tag.value}-expand" type="checkbox" bind:checked={$songListTagsConfig[index].isExpanded} />
		<label for="{index}-{tag.value}-expand">Expanded</label>
	</tag-expand>

	<tag-aligns data-is-active={$songListTagsConfig[index].isExpanded}>
		<tag-align-left class="tag-align">
			<input id="{index}-{tag.value}-l" type="radio" bind:group={$songListTagsConfig[index].align} value="left" />
			<label for="{index}-{tag.value}-l">L</label>
		</tag-align-left>

		<tag-align-center class="tag-align">
			<input id="{index}-{tag.value}-c" type="radio" bind:group={$songListTagsConfig[index].align} value="center" />
			<label for="{index}-{tag.value}-c">C</label>
		</tag-align-center>

		<tag-align-right class="tag-align">
			<input id="{index}-{tag.value}-r" type="radio" bind:group={$songListTagsConfig[index].align} value="right" />
			<label for="{index}-{tag.value}-r">R</label>
		</tag-align-right>
	</tag-aligns>

	<move-icon>
		<MoveIcon style="height: 1.25rem;fill:var(--color-fg-1);margin-left: 1rem;" />
	</move-icon>

	<delete-icon
		on:click={() => {
			removeTagFromTagList(index)
		}}
	>
		<DeleteIcon style="height: 1.25rem;fill:var(--color-fg-1);margin-left: 1rem;" />
	</delete-icon>
</selected-tag-component>

<style>
	selected-tag-component {
		display: grid;
		align-items: center;
		grid-template-columns: max-content auto repeat(4, max-content);
		cursor: grab;
		padding: 0.5rem 1rem;
		margin: 1rem 0;
		background-color: var(--color-bg-2);
	}

	:global(selected-tag-component.slow-transition) {
		transition: transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	selected-tag-component:active {
		cursor: grabbing;
	}

	selected-tag-component tag-name {
		grid-area: 1 / 1;
		cursor: pointer;
	}

	selected-tag-component select {
		cursor: pointer;
		grid-area: 1 / 1;
		height: 100%;
		opacity: 0;
	}

	selected-tag-component tag-empty-space {
		display: block;
		height: 100%;
	}

	selected-tag-component tag-expand label {
		cursor: pointer;
		font-size: 0.9rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
		border: 2px solid var(--color-fg-1);
		padding: 0.15rem 0.3rem;
		border-radius: 3px;
		margin-right: 1rem;

		display: inline-block;

		transition-property: background-color, color, border-color, transform;
		transition-duration: 300ms;
		transition-timing-function: linear;

		transform: translateX(7.5rem);
	}

	selected-tag-component tag-expand[data-is-expanded='true'] label {
		background-color: var(--color-hl-1);
		color: var(--color-bg-1);
		border-color: var(--color-hl-1);
		transform: translateX(0rem);
	}

	selected-tag-component tag-expand input {
		display: none;
	}

	selected-tag-component tag-aligns {
		display: flex;
		flex-direction: row;
		width: calc(28 * 4px);
		justify-content: space-around;
	}

	selected-tag-component tag-aligns .tag-align label {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.9rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
		border: 2px solid var(--color-fg-1);
		border-radius: 3px;
	}

	:where(selected-tag-component tag-aligns .tag-align label) {
		transition: transform 200ms ease-in-out;
	}

	selected-tag-component tag-aligns tag-align-left label {
		transition-delay: 0ms;
	}

	selected-tag-component tag-aligns tag-align-center label {
		transition-delay: 100ms;
	}

	selected-tag-component tag-aligns tag-align-right label {
		transition-delay: 200ms;
	}

	selected-tag-component tag-aligns .tag-align {
		display: block;
		height: 28px;
		width: 28px;
	}

	selected-tag-component tag-aligns[data-is-active='false'] .tag-align label {
		transform: rotateY(90deg);
	}
	selected-tag-component tag-aligns[data-is-active='true'] .tag-align label {
		transform: rotateY(0deg);
	}

	selected-tag-component tag-aligns .tag-align input:checked ~ label {
		background-color: var(--color-hl-1);
		color: var(--color-bg-1);
		border-color: var(--color-hl-1);
	}

	selected-tag-component tag-aligns .tag-align input {
		display: none;
	}

	selected-tag-component move-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	selected-tag-component delete-icon {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
