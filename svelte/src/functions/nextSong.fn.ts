import { playbackIndex } from '../store/player.store'

export function nextSong() {
  let playback = undefined

	playbackIndex.subscribe((playbackStore) => {
		playback = playbackStore
	})()

	playbackIndex.set({
		indexToPlay: playback['indexToPlay'] + 1,
		playNow: true
	})
}
