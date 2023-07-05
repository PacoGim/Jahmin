import { Worker } from 'worker_threads'
import { getWorker } from '../../services/workers.service'
import generateId from '../../functions/generateId.fn'

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
				queryId: string
				queryData: {
					select: string[]
					where?: { [key: string]: string }[]
					orWhere?: { [key: string]: string }[]
					group?: string[]
					order?: string[]
				}
			}
		) => {
			// Generate a unique ID for the query
			data.queryId = generateId()

			// Create a new Promise to return the result of the read operation
			const result = await new Promise<any[]>(resolve => {
				// Define a listener function for the 'message' event on the worker
				function listener(response: any) {
					// Check if the response is of the correct type and if the query IDs match
					if (response.type === 'read') {
						if (data.queryId === response.results.queryId) {
							// If they do, remove the listener from the worker and resolve the Promise with the response
							worker.removeListener('message', listener)
							return resolve(response)
						}
					}
				}

				// Add the listener to the worker
				worker.on('message', listener)

				// Send a message to the worker to perform the read operation
				worker.postMessage({
					type: 'read',
					data
				})
			})

			// Return the result of the read operation
			return result
		}
	)
}
