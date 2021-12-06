import { getArtIPC } from '../services/ipc.service'
import { albumArtMapStore } from '../store/final.store'

export function addIntersectionObserver(albumId: string, elementId: string, artSize: number) {
	let artObserver: IntersectionObserver

	artObserver = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting === true) {
				let albumArtMap

				albumArtMapStore.subscribe(_ => (albumArtMap = _))()

				const ALBUM_ART_MAP_DATA = albumArtMap.get(albumId)

				let albumArtData = ALBUM_ART_MAP_DATA?.video || ALBUM_ART_MAP_DATA?.image

				let artType = ALBUM_ART_MAP_DATA?.video ? 'video' : 'image'

				albumArtData = albumArtData?.[artSize]

				if (albumArtData) {
					let element = document.querySelector(`#${CSS.escape(elementId)}`) as HTMLElement
					let elementSrc

					if (artType === 'image') {
						elementSrc = document.querySelector(`#${CSS.escape(elementId)} > img`) as HTMLImageElement
					} else if (artType === 'video') {
						elementSrc = document.querySelector(`#${CSS.escape(elementId)} > video`) as HTMLVideoElement
					}

					if (element && elementSrc) {
						let elementDataType = element.getAttribute('data-type')
						let elementAlbumId = element.dataset.albumId

						if (elementAlbumId === undefined) {
							element.setAttribute('data-album-id', albumId)
						}

						if (!(elementDataType === 'video' && elementAlbumId === albumId)) {
							element.setAttribute('data-type', artType)
							elementSrc.setAttribute('src', albumArtData.filePath)
							element.setAttribute('data-loaded', 'true')
						}
					}
				} else {
					getArtIPC(albumId, artSize, elementId)
				}

				// "Closes" the Art Observer to avoid unnecessary checks.
				// artObserver.disconnect()
			}
		},
		{ root: document.querySelector('art-grid-svlt'), threshold: 0, rootMargin: '200% 0px 200% 0px' }
	)
	artObserver.observe(document.querySelector(`#${CSS.escape(elementId)}`))
}
