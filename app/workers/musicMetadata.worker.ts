import { parentPort } from 'worker_threads'

let mm: any = undefined

parentPort?.on('message', async filePath => {
	if (mm === undefined) mm = await import('music-metadata')

	mm.parseFile(filePath).then((metadata: any) => {
		parentPort?.postMessage({ filePath, metadata })
	})
})
