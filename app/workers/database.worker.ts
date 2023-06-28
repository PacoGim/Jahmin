import { parentPort } from 'worker_threads'
import { addToQueue } from './db/index.db.js'

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

function create(msg: MessageType) {
	addToQueue({ data: msg.data, type: 'create' }, { at: 'end' })
}

function update(msg: MessageType) {
	addToQueue({ data: msg.data, type: 'update' }, { at: 'start' })
}

function delete_(msg: MessageType) {
	addToQueue({ data: msg.data, type: 'delete' }, { at: 'start' })
}

function initDb(msg: MessageType) {
	import('./db/index.db.js').then(newDb => {
		newDb.init(msg.data.appDataPath)
	})
}
