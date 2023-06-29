import { EventEmitter } from 'events'

export const eventEmitter = new EventEmitter()

let dbVersion = 0

export function getVersion() {
	return dbVersion
}

export function updateVersion() {
	dbVersion += 1
	eventEmitter.emit('dbVersionChange', dbVersion)
}
