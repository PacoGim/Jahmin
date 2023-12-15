import { get } from 'svelte/store'
import { playbackStore, playingSongStore, songListStore } from '../stores/main.store'
import shuffleArrayFn from './shuffleArray.fn'

export default function () {
	return new Promise((resolve, reject) => {
		let shuffledArray = shuffleArrayFn(get(songListStore))

		const playingSong = get(playingSongStore)

		if (playingSong === undefined) return

		let removedSong = shuffledArray.splice(
			shuffledArray.findIndex(song => song.ID === playingSong.ID),
			1
		)

		shuffledArray.unshift(removedSong[0])

		playbackStore.set(shuffledArray)

		resolve(null)
	})
}
