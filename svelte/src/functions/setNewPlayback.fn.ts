import { getAlbumIPC } from '../services/ipc.service'
import { setWaveSource } from '../services/waveform.service'
import { albumPlayingIdStore, playbackCursor, playbackStore, playingSongStore } from '../store/final.store'
import { songToPlayUrlStore } from '../store/player.store'
// import { playback, selectedAlbum } from '../store/player.store'
import type { SongType } from '../types/song.type'
import { getAlbumColors } from './getAlbumColors.fn'

export async function setNewPlayback(
	albumId: string,
	playbackSongs: SongType[],
	songIdToPlay: number | undefined,
	playNow: boolean
) {
	// console.log(albumId, playbackSongs, songIdToPlay, playNow)

	// let indexToPlay = playbackSongs.findIndex(song => song.ID === songIdToPlay)
	let songToPlay = songIdToPlay !== undefined ? playbackSongs.find(song => song.ID === songIdToPlay) : playbackSongs[0]

	playingSongStore.set(songToPlay)
	setWaveSource(songToPlay.SourceFile, albumId, songToPlay.Duration)
	// if (indexToPlay === -1) {
	// 	indexToPlay = 0
	// }

	// let songToPlay= playbackSongs[songIdToPlay]

	albumPlayingIdStore.set(albumId)
	playbackStore.set(playbackSongs)

	if (playNow === true) {
		songToPlayUrlStore.set(songToPlay.SourceFile)
	}

	// playbackCursor.set([indexToPlay, playNow])
	getAlbumColors(albumId)
}

function fetchAlbum(albumId): Promise<SongType[]> {
	return new Promise(async (resolve, reject) => {
		let album = await getAlbumIPC(albumId)
		let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		resolve(songs)
	})
}
