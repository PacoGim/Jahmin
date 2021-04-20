import WaveSurfer from 'wavesurfer.js'

let waveSurfer: WaveSurfer

export function createWaveFormElement(hook: string) {
	waveSurfer = WaveSurfer.create({
		container: '#waveform-image',
		waveColor: 'transparent',
		cursorColor: 'transparent',
    progressColor:'transparent'
	})

	waveSurfer.setHeight(64)
}

export function setWaveSource(source: string) {
	return new Promise((resolve, reject) => {
		waveSurfer.load(source)

		waveSurfer.on('ready', () => {
			resolve('')

			waveSurfer.unAll()
		})
	})
}

export function setWaveColor(hslColorString: string) {
	waveSurfer.setWaveColor(hslColorString)
}
