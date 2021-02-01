import { exec } from 'child_process'
import path from 'path'
import { hash } from './hashString.fn'
import fs from 'fs'
import chokidar from 'chokidar'

const ffmpegPath = path.join(__dirname, '../binaries/mac', 'ffmpeg')
const waveformDirPath = path.join(__dirname, '../waveforms')

export function getWaveform(songPath: string, color: string) {
	return new Promise((resolve, reject) => {
		let hashedPath = hash(songPath)
		exec(
			`'${ffmpegPath}' -i '${songPath}' -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformDirPath}/${hashedPath}.png'`,
			(error, stdout, stderr) => {
				let waveformPath = path.join(waveformDirPath, `${hashedPath}.png`)

				let watcher = chokidar.watch(waveformDirPath)

				watcher.on('add', (path) => {
					if (path === waveformPath) {
						resolve(waveformPath)
						setTimeout(() => {
							fs.unlink(waveformPath, ()=>{})
							watcher.close()
						}, 2000);
					}
				})
			}
		)
	})
}
