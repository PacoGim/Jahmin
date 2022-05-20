<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import tippy from 'tippy.js'
	import generateId from '../functions/generateId.fn'
	import parseDuration from '../functions/parseDuration.fn'
	import tippyService, { defaultTippyOptions } from '../services/tippy.service'

	import type { SelectedTagNameType } from '../types/selectedTag.type'
	import Star from './Star.svelte'

	export let align
	export let tagName: SelectedTagNameType | any
	export let tagValue: any

	let originalTagValue: any

	let dispatch = createEventDispatcher()

	/* 	$: {
		data
		applyChangeToTag()
	} */

	/*function applyChangeToTag() {
		if (tagName === 'Duration') {
			data = parseDuration(data)
		} else if (tagName === 'Rating') {
			data = '★★★★★'
		} else if (tagName === 'BitRate') {
			data = data.toFixed(0) + ' kbps'
		} else if (tagName === 'SampleRate') {
			data = data.toFixed(0) + ' Hz'
		} else if (tagName === 'Size') {
			data = truncateString(bytesToMebibytes(data)) + ' MiB'
		} else if (tagName === 'PlayCount') {
			if (data > 999) {
				tippy('[data-tippy-content]')
				// data = '•••'
			} else {
				data = data || '0'
			}
		}
	}*/

	function bytesToMebibytes(bytesValue: number) {
		return bytesValue / Math.pow(2, 20)
	}

	function truncateString(value: string | number | string[]) {
		value = String(value).split('.')

		return `${value[0]}.${value[1].substring(0, 2)}`
	}

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

{#if tagName !== 'Rating'}
	<span class={tagName} data-tippy-content={originalTagValue} style="text-align: {align}">{parseTag(tagName, tagValue)}</span>
{:else}
	<Star on:starChange={evt => dispatch('starChange', evt.detail)} songRating={tagValue} hook="song-list-item" />
{/if}

<style>
	span {
		margin: 0 0.5rem;
	}

	span.PlayCount {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		width: 36px;
		height: 20px;
		background-color: #fff;
		border-radius: 25px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		color: var(--low-color);
	}

	span.Title {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: 22px;
	}
</style>
