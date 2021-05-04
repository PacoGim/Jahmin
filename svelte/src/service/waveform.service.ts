import WaveSurfer from '../service/wavesurfer/wavesurfer.js'
import { saveWaveformIPC } from './ipc.service.js'

let waveSurfer: WaveSurfer

export function createWaveFormElement(hook: string) {
	waveSurfer = WaveSurfer.create({
		container: hook,
		waveColor: 'transparent',
		cursorColor: 'transparent',
		progressColor: 'transparent',
		normalize: true,
		responsive: true,
		hideScrollbar: true,
		barWidth: 1,
		barGap: null,
		barMinHeight: 1
	})

	waveSurfer.setHeight(64)
}

export function setWaveSource(source: string, duration: number) {
	return new Promise((resolve, reject) => {
		let pcm = JSON.parse(localStorage.getItem(source)) || undefined

		waveSurfer.load(source, pcm, undefined, duration)

		waveSurfer.on('redraw', () => {
			resolve('')
			waveSurfer.unAll()
		})

		waveSurfer.on('peaks-ready', (peaks: number[]) => {
			// TODO Save peaks to pc
			// console.log('peaks-ready', source)
			// localStorage.setItem(source, JSON.stringify(peaks))
			// resolve('')
			// waveSurfer.unAll()
		})
	})
}

let currentWaveColor = ''

export function setWaveColor(hslColorString: string) {
	if (currentWaveColor !== hslColorString) {
		currentWaveColor = hslColorString
		waveSurfer.setWaveColor(hslColorString)
	}
}
