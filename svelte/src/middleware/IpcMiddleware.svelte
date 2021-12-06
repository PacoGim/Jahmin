<script lang="ts">
	const { ipcRenderer } = require('electron')
	import { onMount } from 'svelte'

	import sortSongsArrayFn from '../functions/sortSongsArray.fn'
	import { saveConfig } from '../services/ipc.service'
	import notifyService from '../services/notify.service'
	import { groupByConfig, groupByValuesConfig, songAmountConfig } from '../store/config.store'
	import { albumArtMapStore, albumListStore, selectedGroups, songListStore } from '../store/final.store'
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
	})

	function handleNewArt(data) {
		if (data.success === true) {
			let element = document.querySelector(`#${CSS.escape(data.elementId)}`) as HTMLElement

			let elementSrc

			if (data.fileType === 'image') {
				elementSrc = document.querySelector(`#${CSS.escape(data.elementId)} > img`) as HTMLImageElement
			} else if (data.fileType === 'video') {
				elementSrc = document.querySelector(`#${CSS.escape(data.elementId)} > video`) as HTMLVideoElement
			}

			if (element && elementSrc) {
				let elementDataType = element.getAttribute('data-type')
				let elementAlbumId = element.dataset.albumId

				if (elementAlbumId === undefined) {
					element.setAttribute('data-album-id', data.albumId)
				}


				if (!(elementDataType === 'video' && elementAlbumId === data.albumId)) {

					// TODO

					element.setAttribute('data-type', data.fileType)
					elementSrc.setAttribute('src', data.artInputPath)
					element.setAttribute('data-loaded', 'true')
				}
			}

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
		} else {
			let element = document.querySelector(`#${CSS.escape(data.elementId)}`) as HTMLElement
			let elementSrc = document.querySelector(`#${CSS.escape(data.elementId)} > img`) as HTMLImageElement

			if (elementSrc && element) {
				elementSrc.setAttribute('src', './img/disc-line.svg')
				element.setAttribute('data-loaded', 'true')
				element.setAttribute('data-type', 'unfound')
			}
		}
	}
</script>
