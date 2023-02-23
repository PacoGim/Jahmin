import { setWaveSource } from '../services/waveform.service'
import {
	albumPlayingDirStore,
	currentSongDurationStore,
	currentSongProgressStore,
	isSongShuffleEnabledStore,
	playbackStore,
	playingSongStore,
	triggerScrollToSongEvent
} from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'
import type { SongType } from '../../../types/song.type'
import applyColorSchemeFn from './applyColorScheme.fn'
import getAlbumColorsFn from './getAlbumColors.fn'
import shuffleArrayFn from './shuffleArray.fn'

export default async function (
	rootDir: string,
	playbackSongs: SongType[],
	songIdToPlay: number | undefined,
	{ playNow }: { playNow: boolean }
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

	songToPlayUrlStore.set([songToPlay.SourceFile, { playNow }])

	triggerScrollToSongEvent.set(songToPlay.ID)

	// getAlbumColorsFn(rootDir).then(color => {
	// 	applyColorSchemeFn(color)
	// })
}
