import { Worker } from 'worker_threads'
import { cpus } from 'os'
import path from 'path'

const TOTAL_CPUS = cpus().length
const WORKER_FOLDER_PATH = path.join(path.resolve(), 'electron-app/workers')

type WorkerType = {
	id: number
	type: 'SongData' | 'SongFilter'
	worker: Worker
}

let workers: WorkerType[] = []

export function initWorkers() {
	const SONG_WORKER_QTY = TOTAL_CPUS >= 2 ? 2 : 1

	// Song Data Scan Multi Workers
	for (let i = 0; i !== SONG_WORKER_QTY; i++) {
		const workerSongData = new Worker(getWorkerPath('folderScan'))

		workers.push({
			id: workerSongData.threadId,
			type: 'SongData',
			worker: workerSongData
		})
	}

	// Single worker song array filtering
	const workerSongFilter = new Worker(getWorkerPath('songFilter'))

	workers.push({
		id: workerSongFilter.threadId,
		type: 'SongFilter',
		worker: workerSongFilter
	})
}

export function killAllWorkers() {
	workers.forEach((worker) => worker.worker.terminate())
}

export function getSongFilterWorker() {
	return workers.filter((worker) => worker.type === 'SongFilter')[0].worker
}

export function getSongDataWorkers() {
	return workers.filter((worker) => worker.type === 'SongData').map((worker) => worker.worker)
}

function getWorkerPath(workerName: string) {
	return path.join(WORKER_FOLDER_PATH, `${workerName}.worker.js`)
}
