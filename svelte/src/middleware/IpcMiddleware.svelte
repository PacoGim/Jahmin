<script lang="ts">
	const { ipcRenderer } = require('electron')
	import { onMount } from 'svelte'
	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { saveConfig } from '../services/ipc.service'
	import { songAmountConfig } from '../store/config.store'
	import { albumCoverArtMapStore, songListStore } from '../store/final.store'

	onMount(() => {
		ipcRenderer.on('show-song-amount', (event, data) => {
			$songAmountConfig = data

			saveConfig({
				userOptions: {
					songAmount: data
				}
			})
		})

		ipcRenderer.on('sort-songs', (event, data) => {
			localStorage.setItem(
				'sorting',
				JSON.stringify({
					tag: data.tag,
					order: data.order
				})
			)

			$songListStore = sortSongsArrayFn($songListStore, data.tag, data.order)
		})

		ipcRenderer.on('new-cover', (event, data) => {
			if (data.success === true) {
				$albumCoverArtMapStore.set(data.id, {
					version: Date.now(),
					filePath: data.filePath,
					fileType: data.fileType
				})
				$albumCoverArtMapStore = $albumCoverArtMapStore
			}
		})
	})
</script>
