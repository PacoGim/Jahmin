import Dexie, { liveQuery, Table } from 'dexie'
import generateId from '../functions/generateId.fn'
import getDirectoryFn from '../functions/getDirectory.fn'
import { hash } from '../functions/hashString.fn'
import { dbVersionStore } from '../store/final.store'
import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'

export class JahminDb extends Dexie {
	songs!: Table<SongType>

	constructor() {
		super('JahminDb')

		this.version(1).stores({
			songs:
				'ID,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})
	}
}

export const db = new JahminDb()

// db.delete()

let taskQueue = []
let isQueueRunning = false
let dbVersion = 0
let isVersionUpdating = false

export function addTaskToQueue(object, taskType: 'insert' | 'update' | 'delete') {
	taskQueue.push({
		object,
		taskType
	})

	if (isQueueRunning === false) {
		isQueueRunning = true

		setTimeout(() => {
			runQueue()
		}, 500)
	}
}

async function runQueue() {
	// Groups all the same tasks together.
	let addSongQueue = taskQueue.filter(task => task.taskType === 'insert')
	let deleteSongQueue = taskQueue.filter(task => task.taskType === 'delete')
	let updateSongQueue = taskQueue.filter(task => task.taskType === 'update')

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

	runQueue()
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

export function bulkUpdateSongs(songs: SongType[]) {
	return new Promise((resolve, reject) => {
		resolve(undefined)
		/* 		db.songs
			.bulkAdd(songs)
			.then(() => {
				resolve(undefined)
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			}) */
	})
}

export function bulkDeleteSongs(songsId: number[]) {
	return new Promise((resolve, reject) => {
		db.songs
			.bulkDelete(songsId)
			.then(() => {
				console.log('Deleted Songs')

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

export function getAllSongs(): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		db.songs
			.toArray()
			.then(songs => {
				resolve(songs)
			})
			.catch(err => {
				console.log(err)
			})
	})
}

export function getAlbumSongs(rootDir: string): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		db.songs
			.where('SourceFile')
			.startsWithIgnoreCase(rootDir)
			.toArray()
			.then(songs => {
				resolve(songs)
			})
			.catch(err => {
				console.log(err)
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
		}, 5000)
	} else {
		isVersionUpdating = false
	}
}
