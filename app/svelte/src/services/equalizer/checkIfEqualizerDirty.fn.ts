import { get } from 'svelte/store'
import { isEqualizerDirty, currentEqProfile } from '../../stores/equalizer.store'
import getEqualizerValuesFn from './getEqualizerValues.fn'

export default function () {
	let isDirty = false
	let currentProfile = get(currentEqProfile)
	let equalizerFrequencies = getEqualizerValuesFn()

	if (currentProfile === undefined) return

	for (let frequency in currentProfile.values) {
		if (currentProfile.values[frequency] !== equalizerFrequencies[frequency]) {
			isDirty = true
			break
		}
	}

	isEqualizerDirty.set(isDirty)
}
