export default function (albumId, artSize, artPath) {
	return new Promise((resolve, reject) => {
		let element: HTMLElement = document.querySelector(`art-svlt[data-albumid="${albumId}"][data-artsize="${artSize}"]`)

		// If the image element is in the viewport then load the source.
		if (element !== null) {
			let elementImg = element.querySelector('img')

			// Adds image source and adds the current time to the url to prevent caching.
			elementImg.src = `${artPath}?${Date.now()}`
			element.dataset.loaded = String(true)

			resolve('loaded')
		} else {
			reject('element not found')
			// console.log('No element found for albumId:', albumId, 'artSize:', artSize)

			// console.log('setArtToSrcFn', albumId, artSize, artPath)
		}
	})
}
