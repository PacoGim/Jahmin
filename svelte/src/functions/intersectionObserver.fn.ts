import { compressAlbumArt } from '../services/ipc.service'
import { albumArtMapStore } from '../store/final.store'
import setArtToSrcFn from './setArtToSrc.fn'

export function addIntersectionObserver(element: HTMLElement, albumId: string, artSize: number) {
	let artObserver: IntersectionObserver

	artObserver = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting === true) {
				compressAlbumArt(albumId, [artSize],  false )

				/*
				let albumArtMap

				albumArtMapStore.subscribe(_ => (albumArtMap = _))()

				const ALBUM_ART_MAP_DATA = albumArtMap.get(albumId)

				let albumArtData = ALBUM_ART_MAP_DATA?.video || ALBUM_ART_MAP_DATA?.image

				let artType = ALBUM_ART_MAP_DATA?.video ? 'video' : 'image'

				albumArtData = albumArtData?.[artSize]

				if (albumArtData) {
					albumArtData.success = albumArtData.filePath !== undefined

					albumArtData.albumId = albumId
					// albumArtData.elementId = elementId
					albumArtData.fileType = artType
					albumArtData.artInputPath = albumArtData.filePath

					setArtToSrcFn(albumArtData)
				} else {
					// getArtIPC(albumId, artSize, elementId)
					getArtIPC(albumId, artSize)
				}
				*/

				// "Closes" the Art Observer to avoid unnecessary checks.
				artObserver.disconnect()
			}
		},
		{ root: document.querySelector('art-grid-svlt'), threshold: 0, rootMargin: '200% 0px 200% 0px' }
	)
	artObserver.observe(element)
}
