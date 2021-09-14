<script lang="ts">
	import parseDuration from '../../../../functions/parseDuration.fn'
	import type { SelectedTagNameType } from '../../../../types/selectedTag.type'

	export let align
	export let tagName: SelectedTagNameType

	export let data

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
		}
	}

	function bytesToMebibytes(bytesValue: number) {
		return bytesValue / Math.pow(2, 20)
	}

	function truncateString(value: string | number | string[]) {
		value = String(value).split('.')

		return `${value[0]}.${value[1].substring(0, 2)}`
	}
</script>

<span style="text-align: {align};">{data}</span>

<style>
	span {
		margin: 0.5rem;
	}
</style>
