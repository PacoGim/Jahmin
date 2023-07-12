// Import the Worker class from the worker_threads module
import { Worker } from 'worker_threads'
// Import the getWorker and useWorker functions from the workers.service module
import { getWorker, useWorker } from '../../services/workers.service'

// Declare a variable to hold a Worker instance
let worker: Worker

// Get a worker for the 'database' task and assign it to the worker variable
getWorker('database').then(w => (worker = w))

// Export a default function that takes an ipcMain object as an argument
export default function (ipcMain: Electron.IpcMain) {
	// Set up an event handler for the 'update-play-count' event on the ipcMain object
	ipcMain.handle('update-play-count', async (evt, songId: number, type: 'reset' | 'increment') => {
		// Use a Promise to perform asynchronous operations
		const result = await new Promise<any[]>(resolve => {
			// Use the worker to read data from the database
			useWorker(
				{
					type: 'read',
					data: {
						queryData: {
							select: ['ID', 'PlayCount'],
							andWhere: [{ ID: songId }]
						}
					}
				},
				worker
			).then(response => {
				// If no data is returned, exit early
				if (response.results.data.length === 0) {
					return
				}

				// Get the first song from the returned data
				const song = response.results.data[0]

				// Use the worker to update the play count of the song in the database
				useWorker(
					{
						type: 'update-play-count',
						data: {
							queryData: {
								update: { PlayCount: type === 'reset' ? 0 : song.PlayCount + 1 },
								where: { ID: songId }
							}
						}
					},
					worker
				).then(response => {
					// Resolve the Promise with the updated data
					return resolve(response.results.data)
				})
			})
		})

		// Return the result of the Promise
		return result
	})
}
