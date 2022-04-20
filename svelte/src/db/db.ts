import Dexie, { Table } from 'dexie'
import getDirectoryFn from '../functions/getDirectory.fn'
import { hash } from '../functions/hashString.fn'
import { dbVersionStore } from '../store/final.store'
import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'

export class JahminDb extends Dexie {
	albums!: Table<AlbumType>

	constructor() {
		super('JahminDb')

		this.version(1).stores({
			albums: '++id,Album,AlbumArtist,DynamicAlbumArtist,RootDir,ID,Songs'
		})
	}
}

export const db = new JahminDb()

db.delete()

let taskQueue = []
let isQueueRunning = false
let dbVersion = 0
let isVersionUpdating = false

export function addTaskToQueue(object, taskType: 'create' | 'update' | 'delete') {
	taskQueue.push({
		object,
		taskType
	})

	if (isQueueRunning === false) {
		isQueueRunning = true
		runQueue()
	}
}

function runQueue() {
	let task = taskQueue.shift()

	if (task) {
		if (task.taskType === 'create') {
			addSong(task.object).then(data => {
				runQueue()
			})
		}
	} else {
		isQueueRunning = false
	}
}

function updateVersion() {
	dbVersion++

	if (isVersionUpdating === false) {
		isVersionUpdating = true
		updateStoreVersion()
	}
}

function updateStoreVersion() {
	let dbVersionStoreLocal = undefined

	dbVersionStore.subscribe(value => (dbVersionStoreLocal = value))()

	if (dbVersionStoreLocal !== dbVersion) {
		dbVersionStore.set(dbVersion)

		setTimeout(() => {
			updateStoreVersion()
		}, 5000)
	} else {
		isVersionUpdating = false
	}
}

function addSong(song: SongType) {
	return new Promise(async (resolve, reject) => {
		let albumId = hash(getDirectoryFn(song.SourceFile)) as string

		getAlbumById(albumId).then(dbAlbum => {
			if (dbAlbum === undefined) {
				db.albums
					.add({
						Album: song.Album,
						AlbumArtist: song.AlbumArtist,
						DynamicAlbumArtist: undefined,
						RootDir: getDirectoryFn(song.SourceFile),
						ID: albumId,
						Songs: [song]
					})
					.then(data => {
						updateVersion()
						resolve(data)
					})
			} else {
				if (!dbAlbum.Songs.find(songFoo => songFoo.ID === song.ID)) {
					dbAlbum.Songs.push(song)
					db.albums
						.where('ID')
						.equals(albumId)
						.modify(dbAlbum)
						.then(data => {
							updateVersion()
							resolve(data)
						})
				}
			}
		})
	})
}

export async function bulkDeleteSongs(songs: SongType[]) {
	console.log('bulkDeleteSongs', songs)
	let songsId = songs.map(song => song.ID)

	let songsToDeleteKeys = (await getAllSongs()).filter(song => songsId.includes(song.ID)).map(song => song.id)

	db.songs.bulkDelete(songsToDeleteKeys).then(() => {
		updateVersion()
	})
}

export function deleteSong(song: SongType) {
	return new Promise(async (resolve, reject) => {
		await db.songs
			.where('ID')
			.equals(song.ID)
			.delete()
			.then(() => {
				updateVersion()
			})
	})
}

export function getAlbumById(albumId: string): Promise<AlbumType> {
	return new Promise((resolve, reject) => {
		db.albums
			.where('ID')
			.equals(albumId)
			.toArray()
			.then(albums => {
				let album = albums[0]

				// if (album?.Songs && album?.Album) {
				// 	album.DynamicAlbumArtist = getAllAlbumArtists(album.Songs, album.Album)
				// }

				resolve(album)
			})
	})
}

export function getAllSongs(): Promise<SongType[]> {
	return new Promise(resolve => {
		db.albums.toArray().then(albums => {
			let allSongs = []

			albums.forEach(album => allSongs.push(...album.Songs))

			resolve(allSongs)
		})
	})
}

export function getAlbumSongs(rootDir: string): Promise<SongType[]> {
	return new Promise(resolve => {
		db.albums
			.where('RootDir')
			.startsWithIgnoreCase(rootDir)
			.toArray()
			.then(album => {
				resolve(album[0].Songs)
			})
	})
}

// Iterates through every song of an album to get every single artist, then sorts them by the amount of songs done by artist, the more an artist has songs the firstest it will be in the array.
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
