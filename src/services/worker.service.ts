import { Worker } from 'worker_threads'
import { cpus } from 'os'
import path from 'path'
import fs from 'fs'

const TOTAL_CPUS = cpus().length
const WORKER_FOLDER_PATH = path.join(path.resolve(), 'electron-app/workers')

type WorkerNameType =
	| 'ffmpeg'
	| 'songFilter'
	| 'tagEdit'
	| 'storage'
	| 'folderScan'
	| 'nodeExec'
	| 'musicMetadata'
	| 'exifToolRead'
	| 'exifToolWrite'

type WorkerType = {
	id: number
	name: string
	worker: Worker
}

let workers: WorkerType[] = []

export function initWorkers() {
	let workerFiles = fs.readdirSync(WORKER_FOLDER_PATH)

	workerFiles.forEach((workerFile) => {
		let worker = new Worker(getWorkerPath(workerFile))

		workers.push({
			id: worker.threadId,
			name: workerFile.replace('.worker.js', ''),
			worker
		})
	})
}

export function killAllWorkers() {
	workers.forEach((worker) => worker.worker.terminate())
}

export function getWorker(name: WorkerNameType): Worker | undefined {
	let workerFound = workers.find((worker) => worker.name === name)?.worker

	if (name === 'exifToolWrite') {
		console.log(',,,,,,,,,,,,,,,')
		console.log(name)
		console.log(workers)
		// workers.find((worker) => {
		// 	console.log(worker)
		// })
	}

	if (workerFound) {
		return workerFound
	} else {
		return undefined
	}
}

export function killWorker(name: WorkerNameType) {
	workers.filter((worker) => worker.name === name).forEach((worker) => worker.worker.terminate())
}

function getWorkerPath(workerName: string) {
	return path.join(WORKER_FOLDER_PATH, workerName)
}
