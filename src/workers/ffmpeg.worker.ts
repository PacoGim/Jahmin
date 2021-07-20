import { parentPort } from 'worker_threads'
import { exec } from 'child_process'

parentPort?.on('message', (message) => {
	let { id, filePath, tempFileName, command } = message

	let status = -1

	exec(command, (error, stdout, stderr) => {
		if (error) status = -1

		if (stdout || stderr) {
			status = 1
		}
	}).on('close', () => {
		parentPort?.postMessage({ id, filePath, tempFileName, status })
	})
})
