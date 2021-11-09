import { parentPort } from 'worker_threads'

type FilterSongData = {
	dbSongs: string[]
	userSongs: string[]
}

parentPort?.on('message', (data: FilterSongData) => {
	let { userSongs, dbSongs } = data

	let songsToAdd = userSongs
		.filter(song => !dbSongs.includes(song))
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
	let songsToDelete = dbSongs.filter(song => !userSongs.includes(song))

	parentPort?.postMessage({
		songsToAdd,
		songsToDelete
	})
})
