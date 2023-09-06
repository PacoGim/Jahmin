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
import shuffleArrayFn from './shuffleArray.fn'
import updateConfigFn from './updateConfig.fn'
import { groupByConfig } from '../stores/config.store'
import { get } from 'svelte/store'

export default async function (
	rootDir: string,
	playbackSongs: SongType[],
	songIdToPlay: number | undefined,
	{ playNow }: { playNow: boolean }
) {
	let songToPlay = songIdToPlay !== undefined ? playbackSongs.find(song => song.ID === songIdToPlay) : playbackSongs[0]

	if (songToPlay === undefined) return

	let isSongShuffleEnabled = get(isSongShuffleEnabledStore)

	// isSongShuffleEnabledStore.subscribe(_ => (isSongShuffleEnabled = _))()

	if (isSongShuffleEnabled) {
		let shuffledArray = shuffleArrayFn(playbackSongs)

		if (songIdToPlay !== undefined) {
			let songToPlayIndex = shuffledArray.findIndex(song => song.ID === songIdToPlay)

			songToPlay = shuffledArray.splice(songToPlayIndex, 1)[0]

			shuffledArray.unshift(songToPlay)
		} else {
			songToPlay = shuffledArray[0]
		}
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

	updateConfigFn({
		group: {
			groupByValue: songToPlay[get(groupByConfig)] as string
		}
	})

	// setTimeout(() => {
		// console.log(123)
		// triggerScrollToSongEvent.set(songToPlay.ID)
	// }, 1000)

	// getAlbumColorsFn(rootDir).then(color => {
	// 	applyColorSchemeFn(color)
	// })
}
