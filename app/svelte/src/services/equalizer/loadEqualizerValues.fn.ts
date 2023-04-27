// Takes equalizers values and applies them to the audio players equalizers

import { get } from 'svelte/store'
import { equalizer, isEqualizerDirty, isEqualizerOn } from '../../stores/equalizer.store'

import type { EqualizerProfileValuesType } from '../../../../types/equalizerProfile.type'

export default function (equalizerValues: EqualizerProfileValuesType) {
	isEqualizerDirty.set(false)
	isEqualizerOn.set(true)

	let equalizerLocal = get(equalizer)

	for (const frequency in equalizerValues) {
		equalizerLocal[frequency].gain.value = equalizerValues[frequency]
	}

	equalizer.set(equalizerLocal)
}
