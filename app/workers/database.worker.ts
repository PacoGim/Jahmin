import { parentPort } from 'worker_threads'
import { addTaskToQueue } from './db/!db.js'
import initDBFn from './db/initDB.fn.js'
import { eventEmitter } from './db/dbVersion.fn.js'

type MessageType = {
	type: 'initDb' | 'create' | 'update' | 'delete'
	data: any
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
	}

	if (msg.text === 'initDb') {
		initDb(msg)
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

function initDb(msg: MessageType) {
	import('./db/!db.js').then(() => {
		initDBFn(msg.data.appDataPath)
	})
}
