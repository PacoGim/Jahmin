import { albumCoverArtMapStore } from '../store/final.store'
import { hash } from './hashString.fn'

export function addIntersectionObserver(rootDir: string) {
	return new Promise((resolve, reject) => {
		let coverArtObserver: IntersectionObserver

		let albumId = hash(rootDir, 'text')

		coverArtObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true) {
					let albumCoverArtMap

					albumCoverArtMapStore.subscribe((_) => (albumCoverArtMap = _))()

					const ALBUM_COVER_ART_DATA = albumCoverArtMap.get(albumId)

					// "Closes" the Cover Art Observer to avoid unnecessary checks.
					coverArtObserver.disconnect()

					if (ALBUM_COVER_ART_DATA) {
						resolve({
							status: 'cover-found',
							data: ALBUM_COVER_ART_DATA
						})
					} else {
						resolve({
							status: 'cover-not-found'
						})
					}
				}
			},
			{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '100% 0px 100% 0px' }
		)

		coverArtObserver.observe(document.querySelector(`art-grid-svlt > #${CSS.escape(String(albumId))}`))
	})
}
