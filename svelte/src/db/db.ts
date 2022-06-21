import Dexie, { type Table } from 'dexie'
import getDirectoryFn from '../functions/getDirectory.fn'
import { dbSongsStore, dbVersionStore } from '../store/final.store'
import type { PartialSongType, SongType } from '../types/song.type'

export class JahminDb extends Dexie {
	songs!: Table<SongType>

	constructor() {
		super('JahminDb')

		this.version(2).stores({
			songs:
				'ID,PlayCount,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})
	}
}

export const db = new JahminDb()

// db.delete()

let taskQueue = []
let isQueueRunning = false
let dbVersion = 0
let isVersionUpdating = false

export function addTaskToQueue(object, taskType: 'insert' | 'update' | 'delete' | 'external-update') {
	taskQueue.push({
		object,
		taskType
	})

	if (isQueueRunning === false) {
		isQueueRunning = true

		runQueue()
	}
}

async function runQueue() {
	// Groups all the same tasks together.
	let addSongQueue = taskQueue.filter(task => task.taskType === 'insert')
	let deleteSongQueue = taskQueue.filter(task => task.taskType === 'delete')
	let updateSongQueue = taskQueue.filter(task => task.taskType === 'update' || task.taskType === 'external-update')

	// Removes from the task queue all the tasks that have grouped.
	addSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))
	deleteSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))
	updateSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))

	if (addSongQueue.length === 0 && deleteSongQueue.length === 0 && updateSongQueue.length === 0) {
		isQueueRunning = false
		return
	}

	if (addSongQueue.length > 0) {
		// Run Bulk Add
		await bulkInsertSongs(addSongQueue.map(task => task.object))
	}

	if (deleteSongQueue.length > 0) {
		// Run Bulk Delete
		await bulkDeleteSongs(deleteSongQueue.map(task => task.object))
	}

	if (updateSongQueue.length > 0) {
		// Run Bulk Update
		await bulkUpdateSongs(updateSongQueue.map(task => task.object))
	}

	setTimeout(() => {
		runQueue()
	}, 250)
}

function bulkInsertSongs(songs: SongType[]): Promise<undefined> {
	return new Promise((resolve, reject) => {
		db.songs
			.bulkAdd(songs)
			.then(() => {
				updateVersion()
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}

export function bulkUpdateSongs(songs: { id: string | number; newTags: PartialSongType }[]) {
	return new Promise((resolve, reject) => {
		// Will contain songs grouped by the same new tags to update.
		let updateGroups = []

		// Iterates through each song gets the id and new tags to update.
		songs.forEach(({ id, newTags }) => {
			// Stringyfies the new tags to use as key for the updateGroups object array.
			let objectKey = JSON.stringify(newTags)

			// Checks if the updateGroups already contains the object key a.k.a. the stringyfied new tags object.
			let findGroup = updateGroups.find(group => group.id === objectKey)

			// If the group already exists, add the song id to the array of songs id.
			if (findGroup) {
				findGroup.songsId.push(id)
			} else {
				// If the group doesn't exist, create it.
				updateGroups.push({
					id: objectKey, // The stringyfied new tags object that serves as key id.
					newTags, // The new tags object to know the new tags to update.
					songsId: [id] // The array of songs id to update.
				})
			}
		})

		// Since multiple bulk update will run, it needs to wait for all the updates to finish before resolving.
		let bulkUpdatePromises = []

		// Iterates through each group of songs to update and add the promises to the bulk update promises array.
		updateGroups.forEach(group => {
			bulkUpdatePromises.push(db.songs.where('ID').anyOf(group.songsId).modify(group.newTags))
		})

		// When all promises are done, then update version, catch errors and finally resolve.
		Promise.all(bulkUpdatePromises)
			.then(x => {
				updateVersion()
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}

export function bulkDeleteSongs(songsId: number[]) {
	return new Promise((resolve, reject) => {
		db.songs
			.bulkDelete(songsId)
			.then(() => {
				updateVersion()

				db.songs.count().then(count => {
					if (count === 0) {
						dbSongsStore.set([])
						updateVersion()
					}
				})
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}

export function getAllSongs(): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		dbSongsStore.subscribe(songs => {
			if (songs.length === 0) {
				db.songs.toArray().then(songs => {
					resolve(songs)
				})
			} else {
				resolve(songs)
			}
		})()
	})
}

export function bulkGetSongs(ids: number[]): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		db.songs
			.bulkGet(ids)
			.then(songs => {
				resolve(songs)
			})
			.catch(err => {
				reject(err)
			})
	})
}

export function incrementPlayCount(id: number) {
	db.songs
		.where('ID')
		.equals(id)
		.first()
		.then(song => {
			song.PlayCount = song.PlayCount !== undefined ? song.PlayCount + 1 : 1
			db.songs.put(song).then(() => updateVersion())
		})
}

export function getAlbumSongs(rootDir: string): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		getAllSongs().then(songs => {
			let songsToResolve = songs.filter(song => getDirectoryFn(song.SourceFile) === rootDir)

			resolve(songsToResolve)
		})
	})
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
		}, 500)
	} else {
		isVersionUpdating = false
	}
}
