import { getArtIPC } from '../services/ipc.service'
import { albumArtMapStore } from '../store/final.store'
import { hash } from './hashString.fn'

export function addIntersectionObserver(albumId: string, elementId: string, artSize: number) {
	let artObserver: IntersectionObserver

	artObserver = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting === true) {
				let albumArtMap

				albumArtMapStore.subscribe(_ => (albumArtMap = _))()

				const ALBUM_ART_DATA = albumArtMap.get(albumId)?.[artSize]

				// "Closes" the Art Observer to avoid unnecessary checks.
				artObserver.disconnect()

				if (ALBUM_ART_DATA) {
					let element = document.querySelector(`#${CSS.escape(elementId)}`) as HTMLElement
					let elementImg = document.querySelector(`#${CSS.escape(elementId)} > img`) as HTMLElement

					if (element && elementImg) {
						elementImg.setAttribute('src', ALBUM_ART_DATA.filePath)
						element.setAttribute('data-loaded', 'true')

					}
				} else {
					getArtIPC(albumId, artSize, elementId)
				}
			}
		},
		{ root: document.querySelector('art-grid-svlt'), threshold: 0, rootMargin: '200% 0px 200% 0px' }
	)
	artObserver.observe(document.querySelector(`#${CSS.escape(elementId)}`))
}
