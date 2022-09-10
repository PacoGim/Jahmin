<script lang="ts">
	import { addTaskToQueue } from '../db/!db'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'
	import { songSyncQueueProgress } from '../stores/main.store'

	import Freezeframe from 'freezeframe'

	window.ipc.onGetAllSongsFromRenderer(() => {
		getAllSongsFn().then(songs => {
			window.ipc.sendAllSongsToMain(songs)
		})
	})

	window.ipc.handleWebStorage((_, data) => {
		addTaskToQueue(data.data, data.type)
	})

	window.ipc.handleNewImageArt((_, data) => {
		handleNewImageArt(data)
	})

	window.ipc.handleNewVideoArt((_, data) => {
		handleNewVideoArt(data)
	})

	window.ipc.handleNewAnimationArt((_, data) => {
		handleNewAnimationArt(data)
	})

	window.ipc.sendSingleSongArt((_, data) => {
		setAlbumArtBase64(data)
	})

	window.ipc.songSyncQueueProgress((_, data) => {
		$songSyncQueueProgress = data
	})

	function handleNewAnimationArt(data) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)
		let imgElement = document.createElement('img')
		let altImgElement = document.createElement('img')

		element.classList.add('animation')

		element.querySelectorAll('*').forEach(subElement => subElement.remove())

		imgElement.src = data.artPath
		imgElement.style.position = 'absolute'
		element.appendChild(imgElement)

		if (data?.artAlt) {
			altImgElement.src = `data:image/jpg;base64,${data.artAlt}`

			altImgElement.style.position = 'absolute'
			altImgElement.style.display = 'none'
			altImgElement.classList.add('static')
			element.appendChild(altImgElement)
		}
	}

	function handleNewVideoArt(data) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)
		let videoElement = element.querySelector('video')
		let imageElement = element.querySelector('img')

		if (videoElement === null) {
			videoElement = document.createElement('video')
			videoElement.autoplay = true
			videoElement.loop = true
			element.appendChild(videoElement)
		}

		if (imageElement !== null) {
			element.querySelectorAll('img').forEach(subElement => subElement.remove())
		}

		videoElement.src = data.artPath
	}

	function handleNewImageArt(data) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		let imgElement = document.createElement('img')
		imgElement.src = data.artPath

		element.querySelectorAll('*').forEach(subElement => subElement.remove())

		element.appendChild(imgElement)
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
