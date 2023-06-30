import { parentPort } from 'worker_threads'
import { addTaskToQueue } from './db/!db.js'
import initDBFn from './db/initDB.fn.js'
import { eventEmitter } from './db/dbVersion.fn.js'
import { selectColumns } from './db/bulkRead.fn.js'

type MessageType = {
	type: 'initDb' | 'create' | 'update' | 'delete'
	data:
		| {
				queryType?: 'select columns'
				columns?: string[]
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
	if (msg.data.queryType === 'select columns') {
		selectColumns(msg.data.columns).then(data => {
			parentPort!.postMessage({
				type: 'read',
				data: {
					fields: data,
					...msg.data
				}
			})
		})
	}
}

function initDb(msg: MessageType) {
	import('./db/!db.js').then(() => {
		initDBFn(msg.data.appDataPath)
	})
}
