import { parentPort } from 'worker_threads'
import { SongType } from '../types/song.type'

type FilterSongData = {
	dbSongs: SongType[]
	userSongs: string[]
}

parentPort?.on('message', (data: FilterSongData) => {
	let { userSongs, dbSongs } = data

	let dbSongsPaths = dbSongs.map(song => song.SourceFile)

	let songsToAdd = userSongs
		.filter(song => !dbSongsPaths.includes(song))
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

	parentPort?.postMessage({
		type: 'songsToAdd',
		songs: songsToAdd
	})

	let songsToDelete = dbSongsPaths.filter(song => !userSongs.includes(song))

	parentPort?.postMessage({
		type: 'songsToDelete',
		songs: songsToDelete
	})
})
