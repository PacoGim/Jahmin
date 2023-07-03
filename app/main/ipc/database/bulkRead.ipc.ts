import { Worker } from 'worker_threads'
import { getWorker } from '../../services/workers.service'

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle(
		'bulk-read',
		async (
			evt,
			data: {
				queryId: string
				queryType: 'select generic'
				queryData: { select: string[]; where?: { [key: string]: string }[]; group?: string[]; order?: string[] }
			}
		) => {
			const result = await new Promise<any[]>(resolve => {
				worker.on('message', response => {
					if (data.queryId === response.data.queryId) {
						return resolve(response)
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
