import { Worker } from 'worker_threads'
import { getWorker } from '../../services/workers.service'
import generateId from '../../functions/generateId.fn'

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle(
		'bulk-read',
		async (
			evt,
			data: {
				queryId: string
				queryData: { select: string[]; where?: { [key: string]: string }[]; group?: string[]; order?: string[] }
			}
		) => {
			data.queryId = generateId()

			const result = await new Promise<any[]>(resolve => {
				worker.on('message', response => {
					if (response.type === 'read') {
						if (data.queryId === response.results.queryId) {
							return resolve(response)
						}
					}
				})

				worker.postMessage({
					type: 'read',
					data
				})
			})

			return result
		}
	)
}
