import { getAlbumIPC } from '../services/ipc.service'
import { setWaveSource } from '../services/waveform.service'
import {
	albumPlayingDirStore,
	currentSongDurationStore,
	currentSongProgressStore,
	isSongShuffleEnabledStore,
	playbackStore,
	playingSongStore
} from '../store/final.store'
import { songToPlayUrlStore } from '../store/player.store'
import type { SongType } from '../types/song.type'
import applyColorSchemeFn from './applyColorScheme.fn'
import { getAlbumColors } from './getAlbumColors.fn'
import shuffleArrayFn from './shuffleArray.fn'

export async function setNewPlayback(
	rootDir: string,
	playbackSongs: SongType[],
	songIdToPlay: number | undefined,
	playNow: boolean
) {
	let songToPlay = songIdToPlay !== undefined ? playbackSongs.find(song => song.ID === songIdToPlay) : playbackSongs[0]

	if (songToPlay === undefined) return

	let isSongShuffleEnabled = false

	isSongShuffleEnabledStore.subscribe(_ => (isSongShuffleEnabled = _))()

	if (isSongShuffleEnabled) {
		let shuffledArray = shuffleArrayFn(playbackSongs)
		songToPlay = shuffledArray[0]
		playbackStore.set(shuffledArray)
	} else {
		playbackStore.set(playbackSongs)
	}

	playingSongStore.set(songToPlay)

	currentSongDurationStore.set(songToPlay.Duration)
	currentSongProgressStore.set(0)

	setWaveSource(songToPlay.SourceFile, rootDir, songToPlay.Duration)

	albumPlayingDirStore.set(rootDir)

	if (playNow === true) {
		songToPlayUrlStore.set(songToPlay.SourceFile)
	}

	getAlbumColors(rootDir).then(color => {
		applyColorSchemeFn(color)
	})
}
