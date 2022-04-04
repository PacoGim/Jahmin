import { compressAlbumArt } from '../services/ipc.service'
import { albumArtMapStore } from '../store/final.store'
import setArtToSrcFn from './setArtToSrc.fn'

export function addIntersectionObserver(element: HTMLElement, albumId: string, artSize: number) {
	let artObserver: IntersectionObserver

	artObserver = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting === true) {
				compressAlbumArt(albumId, artSize, false)

				// "Closes" the Art Observer to avoid unnecessary checks.
				artObserver.disconnect()
			}
		},
		{ root: document.querySelector('art-grid-svlt'), threshold: 0, rootMargin: '200% 0px 200% 0px' }
	)
	artObserver.observe(element)
}
