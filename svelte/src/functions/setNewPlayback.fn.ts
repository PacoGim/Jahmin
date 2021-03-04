import { getAlbumColors } from '../service/getAlbumColors.fn'
import { getAlbumIPC } from '../service/ipc.service'
import { playbackCursor } from '../store/final.store'
// import { playback, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'

export async function setNewPlayback(albumID: string, index: number, playNow: boolean) {
	let songs = await fetchAlbum(albumID)

	getAlbumColors(albumID)

	// playback.set({
	// 	AlbumID: albumID,
	// 	SongList: songs
	// })

	playbackCursor.set(undefined)

	playbackCursor.set([index, true])
}

function fetchAlbum(albumID): Promise<SongType[]> {
	return new Promise(async (resolve, reject) => {
		let album = await getAlbumIPC(albumID)
		let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		resolve(songs)
	})
}
