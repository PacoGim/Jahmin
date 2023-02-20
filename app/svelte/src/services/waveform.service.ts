import escapeStringFn from '../functions/escapeString.fn'
import getAlbumColorsFn from '../functions/getAlbumColors.fn'
import WaveSurfer from '../services/wavesurfer/wavesurfer.min'
import cssVariablesService from './cssVariables.service'

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

	let peaks = await window.ipc.getPeaks(sourceFile)
	let color = await getAlbumColorsFn(rootDir)

	cssVariablesService.set('waveform-opacity', '0')

	setTimeout(() => {
		if (waveSurfer !== undefined) {
			waveSurfer.empty()
			waveSurfer.destroy()
			waveSurfer.unAll()
			waveSurfer = undefined
		}

		waveSurfer = getNewWaveSurfer(`hsl(${color.hue},${color.saturation}%,${color.lightnessDark}%)`)

		waveSurfer.load(escapeStringFn(sourceFile), peaks, undefined, duration)

		if (peaks) {
			cssVariablesService.set('waveform-opacity', '1')
		} else {
			waveSurfer.on('redraw', () => {
				cssVariablesService.set('waveform-opacity', '1')

				waveSurfer.exportPCM(1024, undefined, true, undefined).then(newPeaks => {
					window.ipc.savePeaks(sourceFile, newPeaks)
				})
			})
		}
	}, waveformTransitionDuration)
}

export function removeWave() {
	let wave = document.querySelector('#waveform-data wave')

	wave.remove()
}
