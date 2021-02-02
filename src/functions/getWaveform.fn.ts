import { exec, execSync } from 'child_process'
import path from 'path'
import { hash } from './hashString.fn'
import fs, { existsSync } from 'fs'
import chokidar from 'chokidar'
import { appDataPath } from '..'

const ffmpegPath = path.join(__dirname, '../binaries/mac', 'ffmpeg')
// const waveformsDirPath = path.join(__dirname, '../waveforms')

export function getWaveform(songPath: string, color: string) {
	return new Promise((resolve, reject) => {
		let waveformsDirPath = path.join(appDataPath, 'waveforms')

		if (!existsSync(waveformsDirPath)) {
			fs.mkdirSync(waveformsDirPath, { recursive: true })
		}

		let hashedPath = hash(songPath)
		let fileName = `${color}-${hashedPath}.webp`
		let waveformPath = path.join(waveformsDirPath, fileName)

		let folderWatcher = chokidar.watch(waveformsDirPath, { ignoreInitial: true, awaitWriteFinish: true }).on('add', (path) => {
			if (path === waveformPath) {
				resolve(escape(waveformPath))
				folderWatcher.close()
			}
		})

		exec(
			`'${ffmpegPath}' -i "${songPath}" -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformPath}'`,
			(error, stdout, stderr) => {
				if (error) {
					console.log('<<<<<<<<<< ERROR >>>>>>>>>>')
					console.log(error)
				}

				if (stdout) {
					console.log('<<<<<<<<<< STDOUT >>>>>>>>>>')
					console.log(stdout)
				}

				if (stderr) {
					console.log('<<<<<<<<<< STDERR >>>>>>>>>>')
				}
			}
		)
	})
}
