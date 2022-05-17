import { currentAudioElement, playbackStore, playingSongStore, triggerScrollToSongEvent } from '../store/final.store'
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
	let nextSongIndex = currentSongIndex + 1

	let nextSong = playbackStoreValue[nextSongIndex]

	if (nextSong === undefined) return

	songToPlayUrlStore.set([nextSong.SourceFile, { playNow: true }])

	triggerScrollToSongEvent.set(nextSong.ID)
}
