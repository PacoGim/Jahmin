<script lang="ts">
	const { ipcRenderer } = require('electron')
	import { onMount } from 'svelte'
	import { addTaskToQueue, bulkDeleteSongs, bulkUpdateSongs } from '../db/db'
	import generateId from '../functions/generateId.fn'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import {
		sendNewArtQueueProgressIPC,
		saveConfig,
		compressAlbumArtIPC,
		sendAllSongsFromRendererIPC
	} from '../services/ipc.service'
	import notifyService from '../services/notify.service'
	import { directoriesConfig, groupByConfig, groupByValuesConfig, songAmountConfig } from '../store/config.store'
	import {
		albumArtMapStore,
		albumListStore,
		artCompressQueueProgress,
		selectedAlbumId,
		selectedGroups,
		songListStore,
		songSyncQueueProgress
	} from '../store/final.store'
	import { storageService } from '../store/service.store'
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

		// ipcRenderer.on('sort-songs', (event, data) => {
		// 	localStorage.setItem(
		// 		'sorting',
		// 		JSON.stringify({
		// 			tag: data.tag,
		// 			order: data.order
		// 		})
		// 	)

		// 	$songListStore = sortSongsArrayFn($songListStore, data.tag, data.order)
		// })

		ipcRenderer.on('new-art', (event, data) => handleNewArt(data))

		ipcRenderer.on('selected-directories', (event, data) => {
			$directoriesConfig = data
		})

		ipcRenderer.on('web-storage', (event, data) => {
			addTaskToQueue(data.data, data.type)
		})

		ipcRenderer.on('web-storage-bulk-delete', (event, songs) => {
			bulkDeleteSongs(songs)
		})

		ipcRenderer.on('get-all-songs-from-renderer', event => {
			sendAllSongsFromRendererIPC()
		})

		ipcRenderer.on('art-queue-progress', (event, data) => {
			$artCompressQueueProgress = data

			if ($artCompressQueueProgress.currentLength === 0 && $artCompressQueueProgress.maxLength === 0) {
				return
			}

			setTimeout(() => {
				sendNewArtQueueProgressIPC()
			}, 1000)
		})

		ipcRenderer.on('song-sync-queue-progress', (event, data) => {
			$songSyncQueueProgress = data
		})

		ipcRenderer.on('get-art-sizes', (event, data) => {
			document.querySelectorAll(`art-svlt[data-albumid="${data.albumId}"]`).forEach((el: HTMLElement) => {
				compressAlbumArtIPC(data.albumId, el.dataset.artsize, true)
			})
		})
	})

	function handleNewArt(data) {
		if (data.success === false) {
			let element: HTMLElement = document.querySelector(
				`art-svlt[data-albumid="${data.albumId}"][data-artsize="${data.artSize}"]`
			)

			if (!element) return

			let videoElement: HTMLVideoElement = element.querySelector('video')
			let imageElement: HTMLImageElement = element.querySelector('img')

			videoElement.src = ''
			imageElement.setAttribute('src', './img/disc-line.svg')
			element.setAttribute('data-loaded', 'true')
			element.setAttribute('data-type', 'unfound')

			return
		}

		setArtToSrcFn(data.albumId, data.artSize, data.artPath, data.artType).catch(reason => {
			console.log(reason)
		})

		let albumArtData = $albumArtMapStore.get(data.albumId)

		let artData = {
			artSize: data.artSize,
			artPath: data.artPath,
			artType: data.artType
		}

		if (albumArtData) {
			let artDataIndex = albumArtData.findIndex(art => art.artSize === data.artSize)

			if (artDataIndex !== -1) {
				albumArtData[artDataIndex] = artData
			} else {
				albumArtData.push(artData)
			}
		} else {
			albumArtData = [artData]
		}

		$albumArtMapStore = $albumArtMapStore.set(data.albumId, albumArtData)
	}
</script>
