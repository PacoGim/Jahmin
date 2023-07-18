import Dexie, { type Table } from 'dexie'
import 'dexie-observable'
import type { SongType } from '../../../types/song.type'
import { setDB } from './!dbObject'

import bulkDeleteSongsFn from './bulkDeleteSongs.fn'
import bulkInsertSongsFn from './bulkInsertSongs.fn'
import bulkUpdateSongsFn from './bulkUpdateSongs.fn'

export class JahminDb extends Dexie {
	songs!: Table<SongType>

	constructor() {
		super('JahminDb')

		this.version(2).stores({
			songs:
				'ID,PlayCount,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,DateYear,DateMonth,DateDay,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})

		this.version(3).stores({})
	}
}

setDB(new JahminDb())

let taskQueue = []
let isQueueRunning = false

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
		await bulkInsertSongsFn(addSongQueue.map(task => task.object))
	}

	if (deleteSongQueue.length > 0) {
		// Run Bulk Delete
		await bulkDeleteSongsFn(deleteSongQueue.map(task => task.object))
	}

	if (updateSongQueue.length > 0) {
		// Run Bulk Update
		await bulkUpdateSongsFn(updateSongQueue.map(task => task.object))
	}

	setTimeout(() => {
		runQueue()
	}, 5000)
}
