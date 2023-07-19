import { parentPort } from 'worker_threads'
import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

parentPort?.on('message', data => {
	exiftool.read(data.filePath).then((metadata: any) => {
		parentPort?.postMessage({
			workerCallId: data.workerCallId,
			results: {
				filePath: data.filePath,
				metadata,
				status: 1
			}
		})
	})
})
