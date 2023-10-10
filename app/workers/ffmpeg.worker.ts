import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'
import { join as pathJoin } from 'path'
import fs from 'fs'

let ffmpegPath = pathJoin(__dirname, `../../bin`)

let ffmpegBinary = fs.readdirSync(ffmpegPath)

ffmpegPath = pathJoin(ffmpegPath, ffmpegBinary[0])

parentPort?.on('message', data => {
	let { filePath, tempFileName, command, workerCallId } = data

	let status = -1

	spawn(`"${ffmpegPath}" ${command}`, [], { shell: true }).on('close', code => {
		if (code === 0) {
			status = 1
		} else {
			status = 0
		}

		parentPort?.postMessage({
			workerCallId,
			results: {
				filePath,
				tempFileName,
				status
			}
		})
	})
})
