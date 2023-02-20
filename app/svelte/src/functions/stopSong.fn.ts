import {
	altAudioElement,
	currentAudioElement,
	currentSongDurationStore,
	currentSongProgressStore,
	isPlaying,
	mainAudioElement,
	playbackStore,
	playingSongStore
} from '../stores/main.store'

import { removeWave } from '../services/waveform.service'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioElement.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function () {
	let mainAudioElementLocal: HTMLAudioElement = undefined
	let altAudioElementLocal: HTMLAudioElement = undefined

	mainAudioElement.subscribe(value => (mainAudioElementLocal = value))()
	altAudioElement.subscribe(value => (altAudioElementLocal = value))()

	playbackStore.set([])

	playingSongStore.set({
		Title: ''
	})

	currentSongDurationStore.set(0)
	currentSongProgressStore.set(0)

	mainAudioElementLocal.pause()
	altAudioElementLocal.pause()

	mainAudioElementLocal.src = ''
	altAudioElementLocal.src = ''

	removeWave()

	let elementList = document.querySelectorAll(`control-bar-svlt album-art art-svlt > *`)

	elementList.forEach(element => {
		element.remove()
	})

	isPlaying.set(false)
}
