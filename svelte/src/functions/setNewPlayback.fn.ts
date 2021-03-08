import { getAlbumColors } from '../service/getAlbumColors.fn'
import { getAlbumIPC } from '../service/ipc.service'
import { albumPlayingIdStore, playbackCursor, playbackStore } from '../store/final.store'
// import { playback, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'

export async function setNewPlayback(albumID: string, playbackSongs: SongType[], indexToPlay: number, playNow: boolean) {
	albumPlayingIdStore.set(albumID)
	playbackStore.set(playbackSongs)
	playbackCursor.set([indexToPlay, playNow])
	getAlbumColors(albumID)
}

function fetchAlbum(albumID): Promise<SongType[]> {
	return new Promise(async (resolve, reject) => {
		let album = await getAlbumIPC(albumID)
		let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		resolve(songs)
	})
}
