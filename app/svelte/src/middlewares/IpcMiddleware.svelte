<script lang="ts">
	import { addTaskToQueue } from '../db/!db'
	import getAllSongsFn from '../db/getAllSongs.fn'
	import { songSyncQueueProgress } from '../stores/main.store'

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

	window.ipc.songSyncQueueProgress((_, data) => {
		$songSyncQueueProgress = data
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
	 * The logic is to show the animated art the the app is focused and show the static first frame of the animated art when not focused.
	 */
	function handleNewAnimationArt(data) {
		// Selects the Art Container where to set the art src.
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		if (element === null) return

		// Gets the Animated Art Container.
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
			element.append(artAnimationElement)
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

			staticImgElement.classList.add('static')
			artAnimationElement.appendChild(staticImgElement)
		}

		if (data?.artAlt) staticImgElement.src = `data:image/jpg;base64,${data.artAlt}`

		animatedImgElement.src = data.artPath
	}

	function handleNewVideoArt(data) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		if (element === null) return

		let videoElement = element.querySelector('video')

		element.querySelectorAll('img').forEach(imageElement => imageElement.remove())
		element.querySelectorAll('art-animation').forEach(artAnimationElement => artAnimationElement.remove())

		if (videoElement === null) {
			videoElement = document.createElement('video')
			videoElement.autoplay = true
			videoElement.loop = true
			element.appendChild(videoElement)
		}

		if (document.hasFocus() === true) {
			videoElement.play()
		} else {
			videoElement.pause()
		}

		videoElement.src = data.artPath
	}

	function handleNewImageArt(data) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`)

		if (element === null) return

		let imgElement = element.querySelector(':scope > img') as HTMLImageElement

		element.querySelectorAll('video').forEach(videoElement => videoElement.remove())
		element.querySelectorAll('art-animation').forEach(artAnimationElement => artAnimationElement.remove())

		if (imgElement === null) {
			imgElement = document.createElement('img')
			element.appendChild(imgElement)
		}

		imgElement.src = data.artPath
	}
</script>
