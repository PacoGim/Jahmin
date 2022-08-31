import { Worker } from 'worker_threads'
import { join as pathJoin } from 'path'

let workersName = ['exifToolRead', 'exifToolWrite', 'ffmpeg', 'musicMetadata', 'nodeID3', 'sharp', 'songFilter'] as const

type WorkersNameType = typeof workersName[number]

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
		} else {
			resolve(worker?.worker)
		}
	})
}

export function killAllWorkers() {
	workers.forEach(worker => worker.worker.terminate())
}

export function killWorker(workerName: WorkersNameType) {
	workers.filter(worker => worker.name === workerName).forEach(worker => worker.worker.terminate())
}

type WorkerType = {
	id: number
	name: string
	worker: Worker
}
