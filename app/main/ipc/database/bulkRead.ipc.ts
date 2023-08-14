import { Worker } from 'worker_threads'
import { getWorker, useWorker } from '../../services/workers.service'

let worker: Worker

// Get a worker from the workers.service module and assign it to the worker variable
getWorker('database').then(w => (worker = w))

export default function (ipcMain: Electron.IpcMain) {
	// Set up an IPC handler for the 'bulk-read' event
	ipcMain.handle(
		'bulk-read',
		async (
			evt,
			data: {
				workerCallId: string
				queryData: {
					select: string[]
					andWhere?: { [key: string]: string }[]
					orWhere?: { [key: string]: string }[]
					group?: string[]
					order?: string[]
					search?: string
				}
			}
		) => {
			const result = await new Promise<any[]>(resolve => {
				useWorker(
					{
						type: 'read',
						data
					},
					worker
				).then(response => {
					return resolve(response)
				})
			})

			return result
		}
	)
}
