import { Worker } from 'worker_threads'
import { join as pathJoin } from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import generateId from '../functions/generateId.fn'

import type { DatabaseMessageType } from '../../types/databaseWorkerMessage.type'

let workersName = [
	'exifToolRead',
	'exifToolWrite',
	'ffmpeg',
	'ffmpegImage',
	'musicMetadata',
	'nodeID3',
	'sharp',
	'songFilter',
	'database'
] as const

type WorkersNameType = (typeof workersName)[number]

let workers: WorkerType[] = []

export function getWorker(workerName: WorkersNameType): Promise<Worker> {
	return new Promise((resolve, reject) => {
		let worker = workers.find(worker => worker.name === workerName)

		if (worker === undefined) {
			let newWorker = new Worker(pathJoin(__dirname, `../workers/${workerName}.worker.js`))

			workers.push({
				id: newWorker.threadId,
				name: workerName,
				worker: newWorker
			})

			resolve(newWorker)

			if (workerName === 'database') {
				dbWorkerInit()
			}
		} else {
			resolve(worker?.worker)
		}

		console.log(`T:${workers.length} - Worker called: ${workerName}`)
	})
}

async function dbWorkerInit() {
	let dbWorker = await getWorker('database')

	dbWorker.postMessage({
		type: 'initDb',
		data: {
			appDataPath: getAppDataPathFn()
		}
	})

	dbWorker.on('message', results => {
		if (results.type === 'dbVersionChange') {
			sendWebContentsFn('database-update', results.data)
		}
	})
}

export function killAllWorkers() {
	workers.forEach(worker => worker.worker.terminate())
}

export function killWorker(workerName: WorkersNameType) {
	workers.filter(worker => worker.name === workerName).forEach(worker => worker.worker.terminate())
}

export async function useWorker(message: any | DatabaseMessageType, worker: Worker): Promise<any> {
	// Generate a unique ID for the workerCall
	message.workerCallId = generateId()

	// Create a new Promise to return the result of the read operation
	const result = await new Promise(resolve => {
		// Define a listener function for the 'message' event on the worker
		function listener(response: any) {
			if (message.workerCallId === response.workerCallId) {
				// If they do, remove the listener from the worker and resolve the Promise with the response
				worker.removeListener('message', listener)
				return resolve(response)
			}
		}

		// Add the listener to the worker
		worker.on('message', listener)

		// Send a message to the worker to perform the read operation
		worker.postMessage(message)
	})

	// Return the result of the read operation
	return result
}

type WorkerType = {
	id: number
	name: string
	worker: Worker
}
