<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import tippy from 'tippy.js'
	import parseDuration from '../functions/parseDuration.fn'
	import { defaultTippyOptions } from '../services/tippy.service'

	import type { SelectedTagNameType } from '../../../types/selectedTag.type'

	import RatingTag from './tags/RatingTag.svelte'
	import ExtensionTag from './tags/ExtensionTag.svelte'
	import TitleTag from './tags/TitleTag.svelte'

	// export let align
	// export let tagName: SelectedTagNameType | any
	// export let tagValue: any

	export let tag
	export let song

	let originalTagValue: any

	let dispatch = createEventDispatcher()

	function parseTag(tagName, tagValue) {
		if (tagName === 'Duration') return parseDuration(tagValue)

		if (tagName === 'PlayCount') {
			if (tagValue > 999) {
				originalTagValue = tagValue

				setTimeout(() => {
					tippy('[data-tippy-content]', defaultTippyOptions)
				}, 1000)

				return '•••'
			}

			return tagValue || 0
		}

		return tagValue
	}
</script>

<song-tag>
	{#if tag.value === 'Title'}
		<TitleTag {song} align={tag.align} />
	{:else if tag.value === 'Rating'}
		<RatingTag
			on:starChange={evt => dispatch('starChange', evt.detail)}
			align={tag.align}
			songRating={song[tag.value]}
			hook="song-list-item"
		/>
	{:else if tag.value === 'Duration'}
		{parseDuration(song[tag.value])}
	{:else}
		{song[tag.value]}
	{/if}

	<!-- {tag.value} -->
</song-tag>

<!-- {#if tagName === 'Rating'}
	<Star on:starChange={evt => dispatch('starChange', evt.detail)} {align} songRating={tagValue} hook="song-list-item" />
{:else if tagName === 'Extension'}
	<ExtensionTag extension={tagValue} />
{:else}
	<span class={tagName} data-tippy-content={originalTagValue} style="justify-self: {align}">{parseTag(tagName, tagValue)}</span>
{/if} -->

<style>
	song-tag {
		margin: 0 0.5rem;
		display: inline-grid;
	}

	song-tag.PlayCount {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		width: 36px;
		height: 20px;
		background-color: #f8f8ff;
		border-radius: 25px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		color: #333333;
		/* color: var(--art-color-dark); */
	}

	song-tag.Title {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: 22px;
	}
</style>
