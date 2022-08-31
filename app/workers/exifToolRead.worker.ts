import { parentPort } from 'worker_threads'
import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

parentPort?.on('message', (filePath) => {
	exiftool.read(filePath).then((metadata: any) => {
		parentPort?.postMessage({ filePath, metadata })
	})
})
