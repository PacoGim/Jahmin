import { playbackCursor, playbackStore, currentAudioElement } from '../store/final.store'

let player = undefined

export default function () {
	let playbackCursorValue
	let playbackStoreValue

	playbackCursor.subscribe(value => (playbackCursorValue = value))()
	playbackStore.subscribe(value => (playbackStoreValue = value))()

	if (player === undefined) {
		currentAudioElement.subscribe(value => (player = value))()
	}

	if (player.currentTime <= 2) {
		let playbackCursorIndex = playbackCursorValue[0]
		let previousPlaybackCursorIndex = playbackCursorIndex - 1

		let previousSong = playbackStoreValue[previousPlaybackCursorIndex]

		if (previousSong) {
			playbackCursor.set([previousPlaybackCursorIndex, true])
		}
	} else {
		player.currentTime = 0
	}
}
