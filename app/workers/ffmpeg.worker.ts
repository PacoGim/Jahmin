import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'
import { join as pathJoin } from 'path'
import fs from 'fs'
import getOsFn from '../functions/getOs.fn'

let os /* Operating system */ = getOsFn()

let ffmpegPath = pathJoin(__dirname, `../../binaries/${os}`)

let ffmpegBinary = fs.readdirSync(ffmpegPath)

ffmpegPath = pathJoin(ffmpegPath, ffmpegBinary[0])

parentPort?.on('message', message => {
	let { id, filePath, tempFileName, command } = message

	let status = -1

	spawn(`"${ffmpegPath}" ${command}`, [], { shell: true }).on('close', code => {
		if (code === 0) {
			status = 1
		} else {
			status = 0
		}

		parentPort?.postMessage({ id, filePath, tempFileName, status })
	})
})
