export default function (albumId, artSize, artPath, artType) {
	return new Promise((resolve, reject) => {
		let element: HTMLElement = document.querySelector(`art-svlt[data-albumid="${albumId}"][data-artsize="${artSize}"]`)

		// If the image element is in the viewport then load the source.
		if (element !== null) {
			let videoElement: HTMLVideoElement = element.querySelector('video')
			let imageElement: HTMLImageElement = element.querySelector('img')

			if (artType === 'video') {
				element.dataset.type = 'video'
				videoElement.src = `${artPath}`
				imageElement.src = ''
			} else if (artType === 'image') {
				element.dataset.type = 'image'
				// Adds image source and adds the current time to the url to prevent caching.
				// imageElement.src = `${artPath}?${Date.now()}`
				imageElement.src = `${artPath}`
				videoElement.src = ''
			}

			element.dataset.loaded = String(true)

			resolve('loaded')
		} else {
			reject('element not found')
		}
	})
}
