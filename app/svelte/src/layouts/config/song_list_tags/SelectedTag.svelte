<script lang="ts">
	import songListTagsVar from '../../../global/songListTags.var'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'

	import MoveIcon from '../../../icons/MoveIcon.svelte'
	import { config } from '../../../stores/config.store'

	export let tag
	export let index

	function getTagNameFromValue(value: string) {
		return songListTagsVar.find(tag => tag.value === value)?.name
	}

	function removeTagFromTagList(tagIndex: number) {
		// Remove tag from config
		$config.songListTags.splice(tagIndex, 1)

		// Find Dynamic Artists and Title tag index
		let dynamicArtistsTagIndex = $config.songListTags.findIndex(tag => tag.value === 'DynamicArtists')
		let titleTagIndex = $config.songListTags.findIndex(tag => tag.value === 'Title')

		// If Dynamic Artists tag is found but Title is NOT found, remove Dynamic Artists tag
		if (dynamicArtistsTagIndex !== -1 && titleTagIndex === -1) {
			$config.songListTags.splice(dynamicArtistsTagIndex, 1)
		}

		if ($config.songListTags.length === 0) {
			$config.songListTags.push({
				value: 'Album',
				isExpanded: false,
				align: 'center'
			})
		}

		$config.songListTags = $config.songListTags
	}
</script>

<!-- Center end start -->
{#if tag.value !== 'DynamicArtists'}
	<li data-index={index} data-align={tag.align} data-is-expanded={tag.isExpanded} data-value={tag.value}>
		<tag-name>{getTagNameFromValue(tag.value)}</tag-name>
		<select bind:value={$config.songListTags[index].value}>
			{#each songListTagsVar as tag, index (index)}
				<option value={tag.value}>{tag.name}</option>
			{/each}
		</select>
		<tag-empty-space />
		<tag-expand data-is-expanded={$config.songListTags[index].isExpanded}>
			<input id="{index}-{tag.value}-expand" type="checkbox" bind:checked={$config.songListTags[index].isExpanded} />
			<label for="{index}-{tag.value}-expand">Expanded</label>
		</tag-expand>

		<tag-aligns data-is-active={$config.songListTags[index].isExpanded}>
			<tag-align-left class="tag-align">
				<input id="{index}-{tag.value}-l" type="radio" bind:group={$config.songListTags[index].align} value="start" />
				<label for="{index}-{tag.value}-l">L</label>
			</tag-align-left>

			<tag-align-center class="tag-align">
				<input id="{index}-{tag.value}-c" type="radio" bind:group={$config.songListTags[index].align} value="center" />
				<label for="{index}-{tag.value}-c">C</label>
			</tag-align-center>

			<tag-align-right class="tag-align">
				<input id="{index}-{tag.value}-r" type="radio" bind:group={$config.songListTags[index].align} value="end" />
				<label for="{index}-{tag.value}-r">R</label>
			</tag-align-right>
		</tag-aligns>

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
{:else}
	<li class="not-display" data-index={index} data-align={tag.align} data-is-expanded={tag.isExpanded} data-value={tag.value} />
{/if}

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

	li.not-display {
		display: none;
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

	li tag-expand label {
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

	li tag-expand[data-is-expanded='true'] label {
		background-color: var(--color-accent-1);
		color: var(--color-bg-1);
		border-color: var(--color-accent-1);
		transform: translateX(0rem);
	}

	li tag-expand input {
		display: none;
	}

	li tag-aligns {
		display: flex;
		flex-direction: row;
		width: calc(28 * 4px);
		justify-content: space-around;
	}

	li tag-aligns .tag-align label {
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

	:where(li tag-aligns .tag-align label) {
		transition: transform 200ms ease-in-out;
	}

	li tag-aligns tag-align-left label {
		transition-delay: 0ms;
	}

	li tag-aligns tag-align-center label {
		transition-delay: 100ms;
	}

	li tag-aligns tag-align-right label {
		transition-delay: 200ms;
	}

	li tag-aligns .tag-align {
		display: block;
		height: 28px;
		width: 28px;
	}

	li tag-aligns[data-is-active='false'] .tag-align label {
		transform: rotateY(90deg);
	}
	li tag-aligns[data-is-active='true'] .tag-align label {
		transform: rotateY(0deg);
	}

	li tag-aligns .tag-align input:checked ~ label {
		background-color: var(--color-accent-1);
		color: var(--color-bg-1);
		border-color: var(--color-accent-1);
	}

	li tag-aligns .tag-align input {
		display: none;
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
