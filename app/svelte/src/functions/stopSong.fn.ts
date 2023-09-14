import { altAudioElement, currentAudioElement, externalSongProgressChange, mainAudioElement } from '../stores/main.store'

import { get } from 'svelte/store'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioElement.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function () {
	currentAudioElementLocal.currentTime = 0
	externalSongProgressChange.set(0)
	get(mainAudioElement).pause()
	get(altAudioElement).pause()
}
