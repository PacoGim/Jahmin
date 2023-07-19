import { Worker } from 'worker_threads'
import type { SongType } from '../../types/song.type'
import { getWorker, useWorker } from '../services/workers.service'
import sendWebContentsFn from './sendWebContents.fn'

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function ({ enable }: { enable: boolean }, songsToEnableDisable: SongType[]) {
	let ids = songsToEnableDisable.map(song => song.ID)

	useWorker(
		{
			type: 'update-is-enabled',
			data: {
				queryData: {
					update: { IsEnabled: enable },
					where: { ids }
				}
			}
		},
		worker
	)
}
