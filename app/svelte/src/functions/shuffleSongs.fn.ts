import { get } from 'svelte/store'
import {  playbackStore, playingSongStore, songListStore } from '../stores/main.store'
import shuffleArrayFn from './shuffleArray.fn'

export default function () {
	let shuffledArray = shuffleArrayFn(get(songListStore))

	let removedSong = shuffledArray.splice(
		shuffledArray.findIndex(song => song.ID === get(playingSongStore).ID),
		1
	)

	shuffledArray.unshift(removedSong[0])

	playbackStore.set(shuffledArray)
}
