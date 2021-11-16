import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'

parentPort?.on('message', message => {
	let { id, filePath, tempFileName, command } = message

	let status = -1

	spawn(command, [], { shell: true }).on('close', code => {
		if (code === 0) {
			status = 1
		} else {
			status = 0
		}

		parentPort?.postMessage({ id, filePath, tempFileName, status })
	})
})
