import { sqlite3 } from 'sqlite3'
import { SongType } from '../../types/song.type'
import bulkInsertFn from '../db/bulkInsert.fn'
import bulkUpdateFn from './bulkUpdate.fn'
import bulkDeleteFn from './bulkDelete.fn'

type DataType = { type: 'create' | 'read' | 'update' | 'delete'; data: SongType }

const sqlite3: sqlite3 = require('sqlite3').verbose()

let taskQueue: {
	type: 'create' | 'update' | 'delete' | 'external-update'
	data: any
}[] = []
let isQueueRunning = false

async function runQueue() {
	// Groups all the same tasks together.
	let addSongQueue = taskQueue.filter(task => task.type === 'create')
	let deleteSongQueue = taskQueue.filter(task => task.type === 'delete')
	let updateSongQueue = taskQueue.filter(task => task.type === 'update' || task.type === 'external-update')

	// Removes from the main task queue all the tasks that have been already grouped.
	addSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))
	deleteSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))
	updateSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1))

	// If there are no tasks left in the main task queue, the queue is no longer running.
	if (addSongQueue.length === 0 && deleteSongQueue.length === 0 && updateSongQueue.length === 0) {
		isQueueRunning = false
		return
	}

	if (addSongQueue.length > 0) {
		// Run Bulk Add
		await bulkInsertFn(addSongQueue.map(task => task.data))
	}

	if (deleteSongQueue.length > 0) {
		// Run Bulk Delete
		await bulkDeleteFn(deleteSongQueue.map(task => task.data))
	}

	if (updateSongQueue.length > 0) {
		// Run Bulk Update
		await bulkUpdateFn(updateSongQueue.map(task => task.data))
	}

	setTimeout(() => {
		runQueue()
	}, 500)
}

export function addTaskToQueue(data: DataType, type: 'create' | 'update' | 'delete' | 'external-update') {
	taskQueue.push({
		data,
		type
	})

	if (isQueueRunning === false) {
		isQueueRunning = true

		runQueue()
	}
}
