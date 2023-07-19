import { parentPort } from 'worker_threads'

let mm: any = undefined

parentPort?.on('message', async data => {
	if (mm === undefined) mm = await import('music-metadata')

	mm.parseFile(data.filePath).then((metadata: any) => {
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
