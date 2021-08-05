<script>
	const { ipcRenderer } = require('electron')
	import { onMount } from 'svelte'
	import { albumCoverArtMapStore, songListStore } from '../store/final.store'

	onMount(() => {
		ipcRenderer.on('sort-songs', (event, data) => {
			if (['Duration', 'Track', 'Size', 'Sample Rate', 'Rating', 'Disc #', 'BitRate'].includes(data.tag)) {
				if (data.order === 1) {
					$songListStore = $songListStore.sort((a, b) => a[data.tag] - b[data.tag])
				} else {
					$songListStore = $songListStore.sort((a, b) => b[data.tag] - a[data.tag])
				}
			}

			if (['Artist', 'Comment', 'Composer', 'Extension', 'Genre', 'Title'].includes(data.tag)) {
				// console.log(data)
				if (data.order === 1) {
					$songListStore = $songListStore.sort((a, b) => a[data.tag].localeCompare(b[data.tag], undefined, { numeric: true }))
				} else {
					$songListStore = $songListStore.sort((a, b) => b[data.tag].localeCompare(a[data.tag], undefined, { numeric: true }))
				}
			}

			if (['Date'].includes(data.tag)) {
				if (data.order === 1) {
					$songListStore.sort((a, b) => {
						let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
						let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

						return dateA - dateB
					})
				} else {
					$songListStore.sort((a, b) => {
						let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
						let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

						return dateB - dateA
					})
				}
			}

			$songListStore = $songListStore
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
