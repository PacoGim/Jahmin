export default function (data) {
	if (data.success === true) {
		let element = document.querySelector(`#${CSS.escape(data.elementId)}`) as HTMLElement

		let elementSrcVideo = document.querySelector(`#${CSS.escape(data.elementId)} > video`) as HTMLVideoElement
		let elementSrcImage = document.querySelector(`#${CSS.escape(data.elementId)} > img`) as HTMLImageElement

		if (element) {
			let elementAlbumId = element.dataset.albumId

			if (elementAlbumId === undefined) {
				element.setAttribute('data-album-id', data.albumId)
			}

			if (data.fileType === 'image' && data.albumId !== elementSrcVideo.dataset.albumArtId) {
				element.setAttribute('data-type', 'image')
				elementSrcImage.dataset.albumArtId = data.albumId
				elementSrcImage.src = data.artInputPath
				element.setAttribute('data-loaded', 'true')
			} else if (data.fileType === 'video') {
				element.setAttribute('data-type', 'video')
				elementSrcVideo.dataset.albumArtId = data.albumId
				elementSrcVideo.src = data.artInputPath
				element.setAttribute('data-loaded', 'true')
			}
		}
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
