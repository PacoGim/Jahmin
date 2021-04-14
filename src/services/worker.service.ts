import { Worker } from 'worker_threads'
import { cpus } from 'os'

const TOTAL_CPUS = cpus().length

type WorkerType = {
	id: number
	type: 'SongData'
	worker: Worker
}

let workers: WorkerType[] = []

export function initWorkers() {
	const SONG_WORKER_QTY = TOTAL_CPUS - 2 <= 0 ? 1 : TOTAL_CPUS - 2
	// const SONG_WORKER_QTY = 1

	for (let i = 0; i !== SONG_WORKER_QTY; i++) {
		const worker = new Worker('./electron-app/workers/folderScan.worker.js')

		workers.push({
			id: worker.threadId,
			type: 'SongData',
			worker
		})
	}
}

export function getWorkers() {
	return workers
}
