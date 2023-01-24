import {
	currentAudioElement,
	currentSongProgressStore,
	playbackStore,
	playingSongStore,
	triggerScrollToSongEvent
} from '../stores/main.store'
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

	// console.log('Hello')

	let playbackStoreValue: SongType[]
	let songPlayingLocal: SongType = undefined

	playbackStore.subscribe(value => (playbackStoreValue = value))()
	playingSongStore.subscribe(value => (songPlayingLocal = value))()

	let currentSongIndex = playbackStoreValue.findIndex(song => song.ID === songPlayingLocal.ID)
	let nextSongIndex = currentSongIndex + 1

	let nextSong = playbackStoreValue[nextSongIndex]

	if (nextSong === undefined) {
		let currentSong = playbackStoreValue[currentSongIndex]
		currentSongProgressStore.set(0)

		songToPlayUrlStore.set([currentSong.SourceFile, { playNow: false }])
	} else {
		songToPlayUrlStore.set([nextSong.SourceFile, { playNow: true }])

		triggerScrollToSongEvent.set(nextSong.ID)
	}
}
