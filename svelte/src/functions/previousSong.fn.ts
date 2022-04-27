import { playbackStore, currentAudioElement, playingSongStore, triggerScrollToSongEvent } from '../store/final.store'
import { songToPlayUrlStore } from '../store/player.store'
import type { SongType } from '../types/song.type'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioElement.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function () {
	let playbackStoreValue: SongType[]
	let songPlayingLocal: SongType = undefined

	playbackStore.subscribe(value => (playbackStoreValue = value))()
	playingSongStore.subscribe(value => (songPlayingLocal = value))()

	let currentSongIndex = playbackStoreValue.findIndex(song => song.ID === songPlayingLocal.ID)
	let previousSongIndex = currentSongIndex - 1

	let previousSong = playbackStoreValue[previousSongIndex]

	if (previousSong === undefined && currentAudioElementLocal !== undefined) {
		currentAudioElementLocal.currentTime = 0
	}

	if (previousSong !== undefined && (currentAudioElementLocal === undefined || currentAudioElementLocal.currentTime <= 2)) {
		songToPlayUrlStore.set(previousSong.SourceFile)
	} else {
		currentAudioElementLocal.currentTime = 0
	}

	triggerScrollToSongEvent.set(previousSong.ID)
}
