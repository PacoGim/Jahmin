import { parentPort } from 'worker_threads'
import { SongType } from '../types/song.type'

parentPort?.on(
	'message',
	(msg: { type: 'add' | 'delete'; workerCallId: string; data: { userSongs: string[]; dbSongs: SongType[] } }) => {
		let { userSongs, dbSongs } = msg.data
		let dbSourceFiles = new Set(dbSongs.map(song => song.SourceFile))

		if (msg.type === 'add') {
			let songsToAdd = userSongs
				.filter(songPath => !dbSourceFiles.has(songPath))
				.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

			parentPort?.postMessage({
				type: msg.type,
				workerCallId: msg.workerCallId,
				results: {
					songs: songsToAdd
				}
			})
		} else if (msg.type === 'delete') {
			let songsToDelete = Array.from(dbSourceFiles).filter(songPath => userSongs.indexOf(songPath) === -1)
			parentPort?.postMessage({
				type: msg.type,
				workerCallId: msg.workerCallId,
				results: {
					songs: songsToDelete
				}
			})
		}
	}
)

function findSongsToAdd() {}
