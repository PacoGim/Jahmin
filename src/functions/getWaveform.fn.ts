import { exec } from 'child_process'
import path from 'path'
import { hash } from './hashString.fn'
import fs, { existsSync, FSWatcher } from 'fs'
import chokidar from 'chokidar'
import { appDataPath } from '..'
import { getAlbumColors } from '../services/getAlbumColors.fn'

import hslToHex from 'hsl-to-hex'

const ffmpegPath = path.join(__dirname, '../binaries/mac', 'ffmpeg')
export let waveformsFolderWatcher: FSWatcher

export function getWaveformsFolderWatcher() {
	return waveformsFolderWatcher
}

export function getWaveform(songPath: string) {
	return new Promise(async (resolve, reject) => {
		let id = hash(songPath.split('/').slice(0, -1).join('/'))

		let colors = await getAlbumColors(id)

		// let color = colors.hexColor
		let color = hslToHex(colors.hue, colors.saturation, colors.lightnessLow).replace('#', '')

		let waveformsDirPath = path.join(appDataPath, 'waveforms')

		if (!existsSync(waveformsDirPath)) {
			fs.mkdirSync(waveformsDirPath, { recursive: true })
		}

		let hashedPath = hash(songPath)
		let fileName = `${color}-${hashedPath}.webp`
		let waveformPath = path.join(waveformsDirPath, fileName)

		if (fs.existsSync(waveformPath)) {
			return resolve(escape(waveformPath))
		}

		waveformsFolderWatcher = chokidar
			.watch(waveformsDirPath, { ignoreInitial: true, awaitWriteFinish: true })
			.on('add', (path) => {
				if (path === waveformPath) {
					resolve(escape(waveformPath))
					waveformsFolderWatcher.close()
				}
			})

		exec(
			`'${ffmpegPath}' -i "${songPath}" -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformPath}'`
		)
	})
}
