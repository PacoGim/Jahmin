import { parentPort } from 'worker_threads'
import { SongType } from '../types/song.type'

type FilterSongData = {
	dbSongs: SongType[]
	userSongs: string[]
}

parentPort?.on('message', (data: FilterSongData) => {
	let { userSongs, dbSongs } = data

	let dbSourceFiles = dbSongs.map(song => song.SourceFile)

	let songsToAdd = userSongs
		.filter(songPath => dbSourceFiles.indexOf(songPath) === -1)
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

	parentPort?.postMessage({
		type: 'songsToAdd',
		songs: songsToAdd
	})

	let songsToDelete = dbSourceFiles
		.filter(songPath => userSongs.indexOf(songPath) === -1)
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

	parentPort?.postMessage({
		type: 'songsToDelete',
		songs: songsToDelete
	})
})
