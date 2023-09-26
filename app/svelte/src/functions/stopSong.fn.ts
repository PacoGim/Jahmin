import { stopPlayerProgressFunction } from '../stores/functions.store'
import { altAudioElement, currentAudioElement, mainAudioElement } from '../stores/main.store'

import { get } from 'svelte/store'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioElement.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function () {
	get(stopPlayerProgressFunction)()
	get(mainAudioElement).pause()
	get(altAudioElement).pause()
}
