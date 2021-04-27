import { getAlbumColors } from '../service/getAlbumColors.fn'
import { getAlbumIPC } from '../service/ipc.service'
import { albumPlayingIdStore, playbackCursor, playbackStore } from '../store/final.store'
// import { playback, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'

export async function setNewPlayback(
	albumID: string,
	playbackSongs: SongType[],
	SONG_ID_TO_PLAY: number | undefined,
	playNow: boolean
) {
	let indexToPlay = playbackSongs.findIndex((song) => song.ID === SONG_ID_TO_PLAY)

	if (indexToPlay === -1) {
		indexToPlay = 0
	}

	//TODO Sorting

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
