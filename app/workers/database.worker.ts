import { parentPort } from 'worker_threads'
import { addTaskToQueue } from './db/!db.js'
import initDBFn from './db/initDB.fn.js'
import { eventEmitter } from './db/dbVersion.fn.js'
import { selectGeneric } from './db/bulkRead.fn.js'
import updatePlayCountFn from './db/updatePlayCount.fn.js'

type MessageType = {
	type: 'initDb' | 'create' | 'update' | 'delete'
	workerCallId: string
	data:
		| {
				queryData: {
					select: string[]
					andWhere?: { [key: string]: string }[]
					orWhere?: { [key: string]: string }[]
					group?: string[]
					order?: string[]
				}
		  }
		| any
}

parentPort!.on('message', msg => {
	switch (msg.type) {
		case 'initDb':
			initDb(msg)
			break
		case 'create':
			create(msg)
			break
		case 'update':
			update(msg)
			break
		case 'delete':
			delete_(msg)
			break
		case 'read':
			read(msg)
			break
		case 'update-play-count':
			updatePlayCount(msg)
			break
	}
})

eventEmitter.on('dbVersionChange', newValue => {
	parentPort!.postMessage({
		type: 'dbVersionChange',
		data: newValue
	})
})

function create(msg: MessageType) {
	addTaskToQueue(msg.data, 'create')
}

function update(msg: MessageType) {
	addTaskToQueue(msg.data, 'update')
}

function delete_(msg: MessageType) {
	addTaskToQueue(msg.data, 'delete')
}

function read(msg: MessageType) {
	selectGeneric({ ...msg.data.queryData, workerCallId: msg.workerCallId }).then(data => {
		parentPort!.postMessage({
			type: 'read',
			results: data
		})
	})
}

function updatePlayCount(msg: MessageType) {
	updatePlayCountFn({ ...msg.data.queryData, workerCallId: msg.workerCallId }).then(data => {
		parentPort!.postMessage({
			type: 'update-play-count',
			results: data
		})
	})
}

function initDb(msg: MessageType) {
	import('./db/!db.js').then(() => {
		initDBFn(msg.data.appDataPath)
	})
}
