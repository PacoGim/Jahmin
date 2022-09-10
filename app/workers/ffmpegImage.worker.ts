import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'
import { join as pathJoin } from 'path'
import getOsFn from '../functions/getOs.fn'
import generateIdFn from '../functions/generateId.fn'
import fs from 'fs'

let os /* Operating system */ = getOsFn()

let ffmpegPath = pathJoin(__dirname, `../../binaries/${os}/ffmpeg`)

parentPort?.on('message', message => {
	let { artPath, elementId, size, appDataPath } = message

	let tempFolder = pathJoin(appDataPath, '/temp')

	let id = generateIdFn()

	let tempFilePath = `${tempFolder}/${id}.jpg`

	if (!fs.existsSync(tempFolder)) {
		fs.mkdirSync(tempFolder, { recursive: true })
	}

	spawn(`"${ffmpegPath}" -i "${artPath}" -vf scale=${size * 2}:${size * 2} "${tempFilePath}"`, [], { shell: true }).on(
		'close',
		code => {
			if (code === 1) {
				parentPort?.postMessage({
					artPath,
					elementId,
					artAlt: Buffer.from(fs.readFileSync(tempFilePath)).toString('base64')
				})

				fs.unlink(tempFilePath, () => {})
			}
		}
	)
})
