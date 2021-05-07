import { getAlbumColors } from '../service/getAlbumColors.fn'
import { getAlbumIPC } from '../service/ipc.service'
import { albumPlayingIdStore, playbackCursor, playbackStore } from '../store/final.store'
// import { playback, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'

export async function setNewPlayback(
	albumId: string,
	playbackSongs: SongType[],
	SONG_Id_TO_PLAY: number | undefined,
	playNow: boolean
) {
	let indexToPlay = playbackSongs.findIndex((song) => song.ID === SONG_Id_TO_PLAY)

	if (indexToPlay === -1) {
		indexToPlay = 0
	}

	//TODO Sorting

	albumPlayingIdStore.set(albumId)
	playbackStore.set(playbackSongs)
	playbackCursor.set([indexToPlay, playNow])
	getAlbumColors(albumId)
}

function fetchAlbum(albumId): Promise<SongType[]> {
	return new Promise(async (resolve, reject) => {
		let album = await getAlbumIPC(albumId)
		let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		resolve(songs)
	})
}
