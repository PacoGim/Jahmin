import { parentPort } from 'worker_threads'
import hashFn from '../functions/hashString.fn'
import { SongType } from '../types/song.type'

type FilterSongData = {
	dbSongs: SongType[]
	userSongs: string[]
}

parentPort?.on('message', (data: FilterSongData) => {
	let { userSongs, dbSongs } = data

	let dbSongsId = dbSongs.map(song => hashFn(song.SourceFile, 'number'))

	userSongs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

	let songsToAdd = userSongs.filter(songPath => !dbSongsId.includes(hashFn(songPath, 'number')))

	parentPort?.postMessage({
		type: 'songsToAdd',
		songs: songsToAdd
	})

	let songsToDelete = dbSongs.filter(song => !userSongs.includes(song.SourceFile)).map(song => song.ID)

	parentPort?.postMessage({
		type: 'songsToDelete',
		songs: songsToDelete
	})
})