<script lang="ts">
	import { addTaskToQueue } from '../db/!db'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import generateId from '../functions/generateId.fn'
	import { onNewLyrics } from '../stores/crosscall.store'
	import { artCompressQueueLength, layoutToShow, songSyncQueueProgress } from '../stores/main.store'

	window.ipc.onGetAllSongsFromRenderer(() => {
		getAllSongsFn().then(songs => {
			window.ipc.sendAllSongsToMain(songs)
		})
	})

	window.ipc.handleWebStorage((_, response) => {
		addTaskToQueue(response.data, response.type)
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

	window.ipc.songSyncQueueProgress((_, data) => {
		$songSyncQueueProgress = data
	})

	window.ipc.onArtQueueChange((_, artQueueLength) => {
		$artCompressQueueLength = artQueueLength
	})

	window.ipc.onShowLyrics((_, data) => {
		$layoutToShow = 'Lyrics'

		$onNewLyrics = {
			artist: data.artist,
			title: data.title
		}
	})

	/**
	 * @param data
	 * This function get the art source data from the main process and sets the source to the proper element.
	 *
	 * The data received is:
	 * 	· The Path of the animated art.
	 * 	· The id of the element requesting the art.
	 * 	· (Sometimes) The base64 value of the firt frame of the animated art.
	 *
	 * One of the logic is to show the animated art the the app is focused and show the static first frame of the animated art when not focused.
	 */
	function handleNewAnimationArt(data) {
		// Selects the Art Container where to set the art src.
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		// If the element returns null, it means that the element is not in the DOM anymore.
		if (element === null) return

		if (data.artPath === null) {
			element.querySelectorAll('*').forEach(videoElement => videoElement.remove())
			return
		}

		// Gets the Animated Art Container in the Art Container.
		let artAnimationElement = element.querySelector('art-animation') as HTMLElement

		// Gets both img elements inside the Animated Art Container.
		let animatedImgElement = element.querySelector('art-animation img.animated') as HTMLImageElement
		let staticImgElement = element.querySelector('art-animation img.static') as HTMLImageElement

		// Removes all the direct image elements (does not remove img elements deeper than the Art Container) from the Art Container.
		element.querySelectorAll(':scope > img').forEach(imageElement => imageElement.remove())

		// Removes all video elements from the Art Container.
		element.querySelectorAll('video').forEach(videoElement => videoElement.remove())

		// If no Animated Art Container found, create it and append it the the Art Container.
		if (artAnimationElement === null) {
			artAnimationElement = document.createElement('art-animation')
			element.appendChild(artAnimationElement)
		}

		// If no Animated Image Element found, create it and append it to the Animated Art Container.
		if (animatedImgElement === null) {
			animatedImgElement = document.createElement('img')

			// This class is used the differentiate between animated and static images.
			animatedImgElement.classList.add('animated')
			artAnimationElement.appendChild(animatedImgElement)
		}

		// If no Static Image Element found, create it and append it to the Animated Art Container.
		if (staticImgElement === null) {
			staticImgElement = document.createElement('img')

			// When loading the art, don't display the static art if the window is focused.
			if (document.hasFocus() === true) {
				staticImgElement.style.display = 'none'
			}

			// This class is used the differentiate between animated and static images.
			staticImgElement.classList.add('static')

			// Appends the Static Image Element to the Animated Art Container.
			artAnimationElement.appendChild(staticImgElement)
		}

		// If data has artAlt, it means that it contains a base64 static image.
		// If there is no artAlt, it means that there no static image for this animation yet.
		// The first art request sends the animation right away (from the main process), then, the main process gets the first frame of the animation. When the first frame is done, the animation and its first frame (in base64) is sent back and replaced.
		// Sets the static source of the animation art.
		if (data?.artAlt) staticImgElement.src = `data:image/jpg;base64,${data.artAlt}`

		// Sets the animated source of the animation art.
		animatedImgElement.src = `${data.artPath}?time=${generateId()}`
	}

	/**
	 * Shows a video as art.
	 */
	function handleNewVideoArt(data) {
		// Selects the Art Container where to set the art src.
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		// If the element returns null, it means that the element is not in the DOM anymore.
		if (element === null) return

		if (data.artPath === null) {
			element.querySelectorAll('*').forEach(videoElement => videoElement.remove())
			return
		}

		// Removes everything that is not the video element inside the element.
		element.querySelectorAll('img').forEach(imageElement => imageElement.remove())
		element.querySelectorAll('art-animation').forEach(artAnimationElement => artAnimationElement.remove())

		// Selects the video element in the Art Container.
		let videoElement = element.querySelector('video')

		// If no video element create it and the it's loop atribute to true.
		if (videoElement === null) {
			videoElement = document.createElement('video')
			videoElement.loop = true

			// Add the video element to the Main Element
			element.appendChild(videoElement)
		}

		// Sets the source of the video art.
		videoElement.src = `${data.artPath}?time=${generateId()}`

		// If the window is in focus, start playing the video.
		if (document.hasFocus() === true) {
			// Plays the video art.
			videoElement.play()
		}
	}

	function handleNewImageArt(data) {
		// Selects the Art Container where to set the art src.
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		// If the element returns null, it means that the element is not in the DOM anymore.
		if (element === null) return

		if (data.artPath === null) {
			element.querySelectorAll('*').forEach(videoElement => videoElement.remove())
			return
		}

		element.querySelectorAll('video').forEach(videoElement => videoElement.remove())
		element.querySelectorAll('art-animation').forEach(artAnimationElement => artAnimationElement.remove())

		// Selects the direct image element in the Art Container. The Art Container may contain more img elements from potential animated covers, we don't want to select those.
		let imgElement = element.querySelector('img') as HTMLImageElement

		// If no image element, create it.
		if (imgElement === null) {
			imgElement = document.createElement('img')
			element.appendChild(imgElement)
		}

		// Sets the source of the image art.
		imgElement.src = `${data.artPath}?time=${generateId()}`
	}
</script>
