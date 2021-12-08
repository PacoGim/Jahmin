import { playbackCursor } from '../store/final.store'

export function nextSong() {
	let playbackCursorIndex = undefined

	playbackCursor.subscribe(playbackCursorStore => {
		playbackCursorIndex = playbackCursorStore[0]
	})()

	playbackCursor.set([playbackCursorIndex + 1, true])
}
