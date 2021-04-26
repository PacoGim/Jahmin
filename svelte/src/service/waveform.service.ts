import WaveSurfer from 'wavesurfer.js'

let waveSurfer: WaveSurfer

export function createWaveFormElement(hook: string) {
	waveSurfer = WaveSurfer.create({
		container: '#waveform-image',
		waveColor: 'transparent',
		cursorColor: 'transparent',
		progressColor: 'transparent',
		normalize: true,
		responsive:true,
		hideScrollbar:true,
		barWidth:1,
		barGap:0,
		barMinHeight:1
	})

	waveSurfer.setHeight(64)
}

export function setWaveSource(source: string) {
	return new Promise((resolve, reject) => {
		console.time(source)

		waveSurfer.load(source)

		waveSurfer.on('ready', () => {
			console.timeEnd(source)
			resolve('')

			waveSurfer.unAll()
		})
	})
}

export function setWaveColor(hslColorString: string) {
	waveSurfer.setWaveColor(hslColorString)
}
