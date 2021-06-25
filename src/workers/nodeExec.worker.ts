import { parentPort } from 'worker_threads'
import { exec } from 'child_process'

// FFMPEG Binary location

parentPort?.on('message', (command) => {
	exec(command, (error, stdout, stderr) => {

	})
})
