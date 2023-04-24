import { get } from 'svelte/store'
import getAudioFiltersFn from './loadLocalEqualizerProfiles.fn'
import { context, currentEqProfile, equalizer, sourceAltAudio, sourceMainAudio } from '../../stores/equalizer.store'
import loadEqualizerValuesFn from './loadEqualizerValues.fn'

const equalizerGainValues = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384]

export default function () {
	getAudioFiltersFn().then(eqProfile => {
		let contextLocal = get(context)
		let equalizerLocal = get(equalizer)
		let sourceMainAudioLocal = get(sourceMainAudio)
		let sourceAltAudioLocal = get(sourceAltAudio)

		let audioNodeMainAudio = undefined
		let audioNodeAltAudio = undefined

		for (const [index, equalizerGainValue] of equalizerGainValues.entries()) {
			const biquadFilter = contextLocal.createBiquadFilter()
			biquadFilter.type = 'peaking'
			biquadFilter.frequency.value = equalizerGainValue
			biquadFilter.gain.value = 0

			equalizerLocal[equalizerGainValue] = biquadFilter

			// Connects the equalizer filters to the audio node.
			if (index === 0) {
				// If the index is 0, then the audio node is opened and ready from source.
				audioNodeMainAudio = sourceMainAudioLocal.connect(biquadFilter)
				audioNodeAltAudio = sourceAltAudioLocal.connect(biquadFilter)
			} else if (index === equalizerGainValues.length - 1) {
				// If the index is the last, then the audio node is closed and ready to be connected to the destination.
				audioNodeMainAudio = audioNodeMainAudio.connect(biquadFilter)
				audioNodeMainAudio = audioNodeMainAudio.connect(contextLocal.destination)

				audioNodeAltAudio = audioNodeAltAudio.connect(biquadFilter)
				audioNodeAltAudio = audioNodeAltAudio.connect(contextLocal.destination)
			} else {
				// If the index is not 0 or the last, then the audio node is connected to the next filter.
				audioNodeMainAudio = audioNodeMainAudio.connect(biquadFilter)
				audioNodeAltAudio = audioNodeAltAudio.connect(biquadFilter)
			}
		}

		equalizer.set(equalizerLocal)

		currentEqProfile.set(eqProfile)
    loadEqualizerValuesFn(eqProfile.values)
	})
}
