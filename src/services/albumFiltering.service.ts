import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20)

let albumArray: object[] = []

// External resolve. When resolve result set, the promise will be resolved.
let resolvePromise: any = null

export function setAlbumArray(newAlbumArray: any[]) {
	// Saves the new album array for future use.
	albumArray = newAlbumArray
	let newArray: any[] = []

	// Filter the array

	newAlbumArray.forEach((song) => {
		let foundAlbum = newArray.find((i) => i['Album'] === song['Album'])

		if (!foundAlbum) {
			newArray.push({
				ID: nanoid(),
				Album: song['Album'],
				RootDir: song['SourceFile'].split('/').slice(0, -1).join('/'),
				AlbumArtist: song['AlbumArtist'],
				DynamicAlbumArtist: getAllAlbumArtists(newAlbumArray, song['Album'])
			})
		}
	})

	// Sets the external promise resolve result.
	resolvePromise(newArray)
}

function getAllAlbumArtists(songArray: any[], album: string) {
	let artistsCount: any[] = []
	let artistsConcat: any[] = []
	let artistsSorted: string = ''

	songArray.forEach((song) => {
		if (song['Album'] === album) {
			let artists = splitArtists(song['Artist'])
			artistsConcat.push(...artists)
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
		let artistSplit = artists.split(', ')
		artistSplit = artists.split(',')
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
