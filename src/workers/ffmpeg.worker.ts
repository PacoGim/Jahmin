import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'
import path from 'path'

let ffmpegPath = path.join(process.cwd(), '/electron-app/binaries/ffmpeg')

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
