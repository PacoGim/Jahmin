import { playbackStore, currentAudioElement, playingSongStore, triggerScrollToSongEvent } from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'
import type { SongType } from '../../../types/song.type'

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
		songToPlayUrlStore.set([previousSong.SourceFile, { playNow: true }])
	} else {
		if (currentAudioElementLocal !== undefined) {
			currentAudioElementLocal.currentTime = 0
		}
	}

	if (previousSong !== undefined) {
		triggerScrollToSongEvent.set(previousSong.ID)
	}
}
