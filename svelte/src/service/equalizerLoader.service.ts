import type { AudioFilterType } from '../types/audioFilter.type'

export function loadEqualizer() {
	let audioNode = undefined
	let audioFilters = getAudioFilters()

	audioFilters.forEach((audioFilter, index) => {
		const biquadFilter = $context.createBiquadFilter()
		biquadFilter.type = 'peaking'
		biquadFilter.frequency.value = audioFilter.frequency
		biquadFilter.gain.value = audioFilter.gain

		audioFilter.biquadFilter = biquadFilter

		if (index === 0) {
			audioNode = $source.connect(biquadFilter)
		} else if (index === audioFilters.length - 1) {
			audioNode = audioNode.connect(biquadFilter)
			audioNode = audioNode.connect($context.destination)
		} else {
			audioNode = audioNode.connect(biquadFilter)
		}
	})
}

function getAudioFilters(): AudioFilterType[] {

	console.log()

}
