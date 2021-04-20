import { Worker, parentPort } from 'worker_threads'

type FilterSongData = {
	dbSongs: string[]
	foundSongs: string[]
}

parentPort?.on('message', (data: FilterSongData) => {
	let { foundSongs, dbSongs } = data
	let newSongs: string[] = []

	foundSongs.forEach((song) => {
		if (dbSongs.indexOf(song) === -1) {
			newSongs.push(song)
		}
	})

	parentPort?.postMessage(newSongs)
})
