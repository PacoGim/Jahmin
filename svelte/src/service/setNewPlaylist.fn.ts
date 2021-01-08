import { playlist, playlistIndex, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'
import { getAlbumColors } from './getAlbumColors.fn'
import { getAlbumIPC } from './ipc.service'

export async function setNewPlaylist(albumID: string, index: number) {
	let songs = await fetchAlbum(albumID)
	getAlbumColors(albumID)

	playlist.set({
		AlbumID: albumID,
		SongList: songs
	})

	playlistIndex.set(undefined)
	playlistIndex.set(index)
}

function fetchAlbum(albumID): Promise<SongType[]> {
	return new Promise(async (resolve, reject) => {
		let album = await getAlbumIPC(albumID)
		selectedAlbum.set(album)
		let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		resolve(songs)
	})
}
