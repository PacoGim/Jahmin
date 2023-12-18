import { Worker } from 'worker_threads'
import { getWorker, useWorker } from '../../services/workers.service'

let worker: Worker

// Get a worker from the workers.service module and assign it to the worker variable
getWorker('database').then(w => (worker = w))

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('close-db', async () => {
		const result = await new Promise<any[]>(resolve => {
			useWorker(
				{
					type: 'closeDb'
				},
				worker
			).then(response => {
				return resolve(response)
			})
		})

		return result
	})
}
