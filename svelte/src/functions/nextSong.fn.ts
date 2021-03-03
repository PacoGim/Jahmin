// import { playbackCursor } from '../store/player.store'

import { playbackCursor } from '../store/final.store'

export function nextSong() {
	let playbackCursorIndex = undefined

	playbackCursor.subscribe((playbackCursorStore) => {
		playbackCursorIndex = playbackCursorStore[0]
	})()

	playbackCursor.set([playbackCursorIndex + 1, true])

	// let playback = undefined

	// playbackCursor.subscribe((playbackStore) => {
	// 	playback = playbackStore
	// })()

	// playbackCursor.set({
	// 	indexToPlay: playback['indexToPlay'] + 1,
	// 	playNow: true
	// })
}
