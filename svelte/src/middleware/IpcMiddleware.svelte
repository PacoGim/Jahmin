<script lang="ts">
	const { ipcRenderer } = require('electron')
	import { onMount } from 'svelte'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { sendNewArtQueueProgressIPC, saveConfig } from '../services/ipc.service'
	import notifyService from '../services/notify.service'
	import { directoriesConfig, groupByConfig, groupByValuesConfig, songAmountConfig } from '../store/config.store'
	import {
		albumArtMapStore,
		albumListStore,
		artCompressQueueProgress,
		selectedGroups,
		songListStore
	} from '../store/final.store'
	import type { AlbumType } from '../types/album.type'

	onMount(() => {
		ipcRenderer.on('new-group', (event, newGroup) => {
			$groupByConfig[newGroup.index] = newGroup.groupName
			$groupByValuesConfig[newGroup.index] = 'undefined'

			saveConfig({
				group: {
					groupBy: $groupByConfig,
					groupByValues: $groupByValuesConfig
				}
			})
		})

		ipcRenderer.on('albums-grouped', (event, albumsGrouped: AlbumType[]) => {
			// Sort the albums
			$albumListStore = albumsGrouped.sort((a, b) => a.RootDir.localeCompare(b.RootDir, undefined, { numeric: true }))

			// $albumListStore = albumsGrouped
		})

		ipcRenderer.on('notify', (event, data) => {
			if (data.type === 'error') {
				notifyService.error(data.message)
			} else {
				notifyService.success(data.message)
			}
		})

		ipcRenderer.on('group-songs', (event, group) => {
			$selectedGroups[group.index] = group.data
		})

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

		ipcRenderer.on('new-art', (event, data) => handleNewArt(data))

		ipcRenderer.on('selected-directories', (event, data) => {
			$directoriesConfig = data
		})

		ipcRenderer.on('art-queue-progress', (event, data) => {
			$artCompressQueueProgress = data

			setTimeout(() => {
				sendNewArtQueueProgressIPC()
			}, 1000)
		})
	})

	function handleNewArt(data) {
		setArtToSrcFn(data)

		let artMapObject = $albumArtMapStore.get(data.albumId)

		let artData = {
			version: Date.now()
		}

		artData[data.fileType] = {
			[data.artSize]: {
				filePath: data.artInputPath
			}
		}

		if (artMapObject) {
			artData = Object.assign(artMapObject, artData)
		}

		$albumArtMapStore = $albumArtMapStore.set(data.albumId, artData)
	}
</script>
