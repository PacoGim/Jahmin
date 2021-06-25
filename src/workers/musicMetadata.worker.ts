import { parentPort } from 'worker_threads'

const mm = require('music-metadata')

parentPort?.on('message', (filePath) => {
	mm.parseFile(filePath).then((metadata: any) => {
		parentPort?.postMessage({ filePath, metadata })
	})
})
