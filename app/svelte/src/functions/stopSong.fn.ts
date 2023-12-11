import { stopPlayerProgressFunction } from '../stores/functions.store'
import { altAudioPlayer, currentAudioPlayer, mainAudioPlayer } from '../stores/player.store'

import { get } from 'svelte/store'

let currentAudioPlayerLocal: HTMLAudioElement = undefined

let currentAudioPlayerSubscription = currentAudioPlayer.subscribe(value => {
	if (value !== undefined) {
		currentAudioPlayerLocal = value

		currentAudioPlayerSubscription()
	}
})

export default function () {
	get(stopPlayerProgressFunction)()
	get(mainAudioPlayer).pause()
	get(altAudioPlayer).pause()
}
