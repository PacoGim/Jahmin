import type { Table } from 'dexie'
import type { SongType } from '../../../types/song.type'
import type { JahminDb } from './!db'
import updateVersionFn from './updateVersion.fn'

let db: any = undefined

export function setDB(newDb: any) {
	db = newDb

	db.on('changes', function (changes) {
		changes.forEach(function (change) {
			switch (change.type) {
				case 1: // CREATED
					updateVersionFn()
					break
				case 2: // UPDATED
					updateVersionFn()
					break
				case 3: // DELETED
					updateVersionFn()
					break
			}
		})
	})
}

export function getDB(): JahminDb {
	return db
}
