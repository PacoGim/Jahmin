import { Worker } from 'worker_threads'
import type { SongType } from '../../types/song.type'
import { getWorker, useWorker } from '../services/workers.service'

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function ({ enable }: { enable: boolean }, songsToEnableDisable: SongType[]) {
	useWorker(
		{
			type: 'update-is-enabled',
			data: {
				queryData: {
					update: { IsEnabled: enable },
					where: { IDs: songsToEnableDisable.map(song => song.ID) }
				}
			}
		},
		worker
	)
}
