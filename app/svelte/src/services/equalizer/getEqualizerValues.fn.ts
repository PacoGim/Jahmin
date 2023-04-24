import { get } from 'svelte/store'
import { equalizer } from '../../stores/equalizer.store'

export default function () {
	let equalizerLocal = get(equalizer)

	let frequencies = {}

	for (let frequency in equalizerLocal) {
		frequencies[frequency] = equalizerLocal[frequency].gain.value
	}

	return frequencies
}
