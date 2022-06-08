import { escapeString } from '../functions/escapeString.fn.js'
import { getAlbumColors } from '../functions/getAlbumColors.fn.js'
import WaveSurfer from '../services/wavesurfer/wavesurfer.min.js'
import { getPeaksIPC, savePeaksIPC } from './ipc.service.js'

let waveformTransitionDuration = Number(
	getComputedStyle(document.body).getPropertyValue('--waveform-transition-duration').replace('ms', '')
)

let waveSurfer = undefined

function getNewWaveSurfer(color: string) {
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
		barMinHeight: 1 / 3
	})

	waveSurfer.setWaveColor(color)
	waveSurfer.setHeight(64)

	return waveSurfer
}

let lastSongSourceFile = ''

export async function setWaveSource(sourceFile: string, rootDir: string, duration: number) {
	if (sourceFile === lastSongSourceFile) {
		return
	} else {
		lastSongSourceFile = sourceFile
	}

	let peaks = await getPeaksIPC(sourceFile)
	let color = await getAlbumColors(rootDir)

	document.documentElement.style.setProperty('--waveform-opacity', '0')

	setTimeout(() => {
		if (waveSurfer !== undefined) {
			waveSurfer.empty()
			waveSurfer.destroy()
			waveSurfer.unAll()
			waveSurfer = undefined
		}

		waveSurfer = getNewWaveSurfer(`hsl(${color.hue},${color.saturation}%,${color.lightnessDark}%)`)

		waveSurfer.load(escapeString(sourceFile), peaks, undefined, duration)

		if (peaks) {
			document.documentElement.style.setProperty('--waveform-opacity', '1')
		} else {
			waveSurfer.on('redraw', () => {
				document.documentElement.style.setProperty('--waveform-opacity', '1')

				waveSurfer.exportPCM(1024, undefined, true, undefined).then(newPeaks => {
					savePeaksIPC(sourceFile, newPeaks)
				})
			})
		}
	}, waveformTransitionDuration)
}
