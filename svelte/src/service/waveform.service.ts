import WaveSurfer from '../service/wavesurfer/wavesurfer.min.js'
import { getPeaksIPC, savePeaksIPC } from './ipc.service.js'

// let waveSurfer: WaveSurfer
let waveSurfer = undefined

function getNewWaveSurfer(hslColorString: string) {
	let waveSurfer = WaveSurfer.create({
		container: '#waveform-data',
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
	waveSurfer.setWaveColor('#000')
	// waveSurfer.setWaveColor(hslColorString)
	waveSurfer.setHeight(64)

	return waveSurfer
}

export function setWaveSource(sourceFile: string, duration: number) {
	return new Promise(async (resolve, reject) => {
		document.documentElement.style.setProperty('--waveform-opacity', '0')
		if (waveSurfer !== undefined) {
			waveSurfer.empty()
			waveSurfer.destroy()
			waveSurfer.unAll()
			waveSurfer = undefined
			document.querySelector('wave').remove()
		}

		waveSurfer = getNewWaveSurfer('')

		let peaks = await getPeaksIPC(sourceFile)

		waveSurfer.load(sourceFile, peaks, undefined, duration)

		waveSurfer.on('redraw', (newPeaks) => {
			document.documentElement.style.setProperty('--waveform-opacity', '1')
			if (!peaks) {
				savePeaksIPC(sourceFile, newPeaks)
			}
		})
	})
}

// let currentWaveColor = ''

// export function setWaveColor(hslColorString: string) {
// 	if (currentWaveColor !== hslColorString) {
// 		currentWaveColor = hslColorString
// 	}
// }
