import WaveSurfer from '../service/wavesurfer/wavesurfer.min.js'
import { getPeaksIPC, savePeaksIPC } from './ipc.service.js'

let waveformTransitionDuration = Number(
	getComputedStyle(document.body).getPropertyValue('--waveform-transition-duration').replace('ms', '')
)

let waveSurfer = undefined

function getNewWaveSurfer() {
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
		barMinHeight: 1/3
	})

	waveSurfer.setWaveColor(getComputedStyle(document.body).getPropertyValue('--low-color'))
	waveSurfer.setHeight(64)

	return waveSurfer
}

export async function setWaveSource(sourceFile: string, duration: number) {
	let peaks = await getPeaksIPC(sourceFile)

	document.documentElement.style.setProperty('--waveform-opacity', '0')

	setTimeout(() => {
		if (waveSurfer !== undefined) {
			waveSurfer.empty()
			waveSurfer.destroy()
			waveSurfer.unAll()
			waveSurfer = undefined
		}

		waveSurfer = getNewWaveSurfer('')
		waveSurfer.load(sourceFile, peaks, undefined, duration)

		if (peaks) {
			document.documentElement.style.setProperty('--waveform-opacity', '1')
		} else {
			waveSurfer.on('redraw', () => {
				document.documentElement.style.setProperty('--waveform-opacity', '1')

				waveSurfer.exportPCM(512, undefined, true, undefined).then((newPeaks) => {
					savePeaksIPC(sourceFile, newPeaks)
				})
			})
		}
	}, waveformTransitionDuration)
}
