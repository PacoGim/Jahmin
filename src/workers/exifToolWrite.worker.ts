import { parentPort } from 'worker_threads'
import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

parentPort?.on('message', (data) => {
	exiftool
		.write(data.filePath, data.newTags, ['-overwrite_original'])
		.then(() => {
			parentPort?.postMessage({ filePath: data.filePath, status: 1 })
		})
		.catch((err) => {
			parentPort?.postMessage({ filePath: data.filePath, status: -1 })
		})
})
