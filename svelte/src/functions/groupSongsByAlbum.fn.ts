import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'
import { hash } from './hashString.fn'

export default function (songs: SongType[]): Promise<AlbumType[]> {
	return new Promise((resolve, reject) => {
		let albums = []
		songs.forEach(song => {
			const rootDir = song.SourceFile.split('/').slice(0, -1).join('/')
			const albumId = hash(rootDir)

			let album = albums.find(album => album.ID === albumId)

			if (album === undefined) {
				album = {
					ID: albumId,
					RootDir: rootDir,
					Name: song.Album || '',
					AlbumArtist: song.AlbumArtist,
					DynamicAlbumArtist: getAllAlbumArtists(songs, song.Album),
					Songs: []
				}

				albums.push(album)
			}

			album.Songs.push(song)

			albums[albums.indexOf(album)] = album
		})

		resolve(albums)
	})
}

function getAllAlbumArtists(songArray: any[], album: string | undefined | null) {
	let artistsCount: any[] = []
	let artistsConcat: any[] = []
	let artistsSorted: string = ''

	songArray.forEach(song => {
		if (song['Album'] === album) {
			let artists = splitArtists(song['Artist'])

			if (artists.length > 0) {
				artistsConcat.push(...artists)
			} else {
				artistsConcat = artists
			}
		}
	})

	artistsConcat.forEach(artist => {
		let foundArtist = artistsCount.find(i => i['Artist'] === artist)

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
	artistsSorted = artistsCount.map(a => a['Artist']).join(', ')

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
