<script lang="ts">
	import { onMount } from 'svelte'
	import tippy from 'tippy.js'
	import generateId from '../functions/generateId.fn'
	import parseDuration from '../functions/parseDuration.fn'
	import tippyService from '../services/tippy.service'

	import type { SelectedTagNameType } from '../types/selectedTag.type'

	export let align
	export let tagName: SelectedTagNameType | any
	export let data
	export let customStyle = ''

	$: {
		data
		applyChangeToTag()
	}

	function applyChangeToTag() {
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
	}

	function bytesToMebibytes(bytesValue: number) {
		return bytesValue / Math.pow(2, 20)
	}

	function truncateString(value: string | number | string[]) {
		value = String(value).split('.')

		return `${value[0]}.${value[1].substring(0, 2)}`
	}

	onMount(() => {
		applyChangeToTag()
	})
</script>

{#if tagName === 'PlayCount'}
	<span data-tippy-content={data} style="text-align: {align};{customStyle}">{data}</span>
{:else}
	<span style="text-align: {align};{customStyle}">{data}</span>
{/if}

<style>
	span {
		margin: 0 0.5rem;
	}
</style>
