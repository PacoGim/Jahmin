import { hash } from '../functions/hashString.fn'

let albumArray: object[] = []

// External resolve. When resolve result set, the promise will be resolved.
let resolvePromise: any = null

export function setAlbumArray(newAlbumArray: any[]) {
	// Saves the new album array for future use.
	albumArray = newAlbumArray
	let newArray: any[] = []

	// Group Songs by root folder
	newAlbumArray.forEach((song) => {
		let rootDir = song['SourceFile'].split('/').slice(0, -1).join('/')
		let foundAlbum = newArray.find((i) => i['RootDir'] === rootDir)

		if (!foundAlbum) {
			newArray.push({
				ID: hash(rootDir),
				Name: song['Album'],
				RootDir: rootDir,
				AlbumArtist: song['AlbumArtist'],
				DynamicAlbumArtist: getAllAlbumArtists(newAlbumArray, song['Album']),
				Songs: [song]
			})
		} else {
			foundAlbum['Songs'].push(song)
		}
	})

	albumArray = newArray

	// Sets the external promise resolve result.
	resolvePromise(newArray)
}

// Iterates through every song of an album to get every single artist, then sorts them by the amount of songs done by artist, the more an artist has songs the firstest it will be in the array.
function getAllAlbumArtists(songArray: any[], album: string) {
	let artistsCount: any[] = []
	let artistsConcat: any[] = []
	let artistsSorted: string = ''

	songArray.forEach((song) => {
		if (song['Album'] === album) {
			let artists = splitArtists(song['Artist'])

			if (artists.length > 0) {
				artistsConcat.push(...artists)
			} else {
				artistsConcat = artists
			}
		}
	})

	artistsConcat.forEach((artist) => {
		let foundArtist = artistsCount.find((i) => i['Artist'] === artist)

		if (foundArtist) {
			foundArtist['Count']++
		} else {
			artistsCount.push({
				Artist: artist,
				Count: 0
			})
		}
	})

	artistsCount = artistsCount.sort((a, b) => b['Count'] - a['Count'])
	artistsSorted = artistsCount.map((a) => a['Artist']).join(', ')

	return artistsSorted
}

function splitArtists(artists: string) {
	if (artists) {
		let artistSplit: string[] = []

		if (typeof artists === 'string') {
			artistSplit = artists.split(', ')
			artistSplit = artists.split(',')
		}

		return artistSplit
	}
	return []
}

export function getAlbumArray() {
	return albumArray
}

// Retuns a new Promise so it can be called anywhere in the app and will be resolved whenever the Promise external resolve is completed.
export function getNewPromiseAlbumArray() {
	return new Promise((resolve) => (resolvePromise = resolve))
}
