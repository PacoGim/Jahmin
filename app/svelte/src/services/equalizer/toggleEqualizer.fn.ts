import { get } from 'svelte/store'
import { currentEqProfile, equalizer, isEqualizerOn } from '../../stores/equalizer.store'

export default function () {
	let isEqualizerOnLocal = get(isEqualizerOn)
	let equalizerLocal = get(equalizer)
	let currentEqProfileLocal = get(currentEqProfile)

	for (let frequency in equalizerLocal) {
		equalizerLocal[frequency].gain.value = isEqualizerOnLocal === true ? 0 : currentEqProfileLocal.values[frequency]
	}

	isEqualizerOn.set(!isEqualizerOnLocal)

	equalizer.set(equalizerLocal)
}
