<script lang="ts">
	import { addTaskToQueue } from '../db/!db'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'
	import { albumArtMapStore, songSyncQueueProgress } from '../stores/main.store'

	window.ipc.onGetAllSongsFromRenderer(() => {
		getAllSongsFn().then(songs => {
			window.ipc.sendAllSongsToMain(songs)
		})
	})

	window.ipc.handleWebStorage((_, data) => {
		addTaskToQueue(data.data, data.type)
	})

	window.ipc.handleNewArt((_, data) => {
		handleNewArt(data)
	})

	window.ipc.sendSingleSongArt((_, data) => {
		setAlbumArtBase64(data)
	})

	window.ipc.songSyncQueueProgress((_, data) => {
		$songSyncQueueProgress = data
	})

	function handleNewArt(data) {
		// If the first attempt of finding the album art fails
		if (data.success === false) {
			let element: HTMLElement = document.querySelector(
				`art-svlt[data-albumid="${data.albumId}"][data-artsize="${data.artSize}"]`
			)

			// If the art element is not loaded anymore, return
			if (!element) return

			let dataSet = element.dataset

			// Attempts to get an album art from a song file instead of from a root directory
			window.ipc.compressSingleSongAlbumArt(
				dataSet?.playingSongSourcefile || dataSet?.rootdir,
				dataSet.artsize,
				dataSet.albumid
			)

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

	// Sets a Base64 encoded album art into a imag element src
	function setAlbumArtBase64(data) {
		let element: HTMLElement = document.querySelector(
			`art-svlt[data-albumid="${data.albumId}"][data-artsize="${data.artSize}"]`
		)

		// If the art element is not loaded anymore, return
		if (!element) return

		// Gets the video and image elements
		let videoElement: HTMLVideoElement = element.querySelector('video')
		let imageElement: HTMLImageElement = element.querySelector('img')

		// Sets the video to nothing
		videoElement.src = ''

		// If a Base64 encoded album art is given, sets it to the image element src
		if (data.cover !== null) {
			imageElement.setAttribute('src', data.cover)
			element.setAttribute('data-type', 'image')
		} else {
			// If not, load a placeholder image
			imageElement.setAttribute('src', 'assets/img/disc-line.svg')
			element.setAttribute('data-type', 'unfound')
		}
		element.setAttribute('data-loaded', 'true')
	}
</script>
