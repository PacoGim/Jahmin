<script lang="ts">
	import { onDestroy } from 'svelte'
	import type { PartialSongType } from '../../../../types/song.type'
	import tippyService, { deleteInstance } from '../../services/tippy.service'
	import generateId from '../../functions/generateId.fn'

	export let song: PartialSongType

	let id = undefined

	function formatPlayCount(playCountValue: number) {
		if (playCountValue <= 999) {
			return playCountValue
		}

		let kValue = Math.trunc(playCountValue / 1e3)

		if (kValue * 1e3 > 9000) {
			return 9 + 'k+'
		}

		if (playCountValue > kValue * 1e3) {
			return kValue + 'k+'
		} else {
			return kValue + 'k'
		}
	}

	function createTippy(event: MouseEvent) {
		if (song.PlayCount > 999 && id === undefined) {
			let targetElement = event.target as HTMLElement
			id = generateId()

			tippyService(id, targetElement, {
				content: `<bold>${song.PlayCount}</bold>`
			})
		}
	}

	onDestroy(() => {
		deleteInstance(id)
	})
</script>

<playcount-tag on:mouseover={createTippy} on:focus={createTippy}>
	{formatPlayCount(song.PlayCount)}
</playcount-tag>

<style>
	playcount-tag {
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
	}
</style>
