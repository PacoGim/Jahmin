import { albumArtMapStore } from '../store/final.store'
import { hash } from './hashString.fn'

export function addIntersectionObserver(rootDir: string) {
	return new Promise((resolve, reject) => {
		let artObserver: IntersectionObserver

		let albumId = hash(rootDir, 'text')

		artObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true) {
					let albumArtMap

					albumArtMapStore.subscribe((_) => (albumArtMap = _))()

					const ALBUM_ART_DATA = albumArtMap.get(albumId)

					// "Closes" the Art Observer to avoid unnecessary checks.
					artObserver.disconnect()

					if (ALBUM_ART_DATA) {
						resolve({
							status: 'art-found',
							data: ALBUM_ART_DATA
						})
					} else {
						resolve({
							status: 'art-not-found'
						})
					}
				}
			},
			{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '100% 0px 100% 0px' }
		)

		artObserver.observe(document.querySelector(`art-grid-svlt > #${CSS.escape(String(albumId))}`))
	})
}
