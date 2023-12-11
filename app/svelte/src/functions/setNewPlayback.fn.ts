import { setWaveSource } from '../services/waveform.service'
import { albumPlayingDirStore, currentSongDurationStore, playbackStore, playingSongStore } from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'
import type { SongType } from '../../../types/song.type'
import shuffleArrayFn from './shuffleArray.fn'
import updateConfigFn from './updateConfig.fn'
import { groupByConfig } from '../stores/config.store'
import { get } from 'svelte/store'
import findNextValidSongFn from './findNextValidSong.fn'
import notifyService from '../services/notify.service'

export default async function setNewPlaybackFn(
	rootDir: string,
	playbackSongs: SongType[],
	songIdToPlay: number | undefined,
	{ playNow }: { playNow: boolean },
	{ shuffle }: { shuffle: boolean }
) {
	let songToPlayIndex = songIdToPlay !== undefined ? playbackSongs.findIndex(song => song.ID === songIdToPlay) : 0
	let songToPlay = playbackSongs[songToPlayIndex]

	if (songToPlay === undefined) {
		console.log('setNewPlaybackFn: songToPlay is undefined')
		return
	}

	// Checks if the song is disabled
	if (songToPlay.IsEnabled === 0) {
		// Finds the next valid song to play
		let nextValidSong = findNextValidSongFn(songToPlayIndex, playbackSongs)

		// If there is a valid song to play, it will play it
		if (nextValidSong !== undefined) {
			return setNewPlaybackFn(rootDir, playbackSongs, nextValidSong.ID, { playNow }, { shuffle })
		} else {
			// If there is no valid song to play, it will notify the user
			return notifyService.error('No enabled songs found')
		}
	}

	if (shuffle) {
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
	// currentSongProgressStore.set(0)

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
