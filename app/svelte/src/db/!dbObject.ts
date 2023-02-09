import type { JahminDb } from './!db'
import updateVersionFn from './updateVersion.fn'

let db: any = undefined

export function setDB(newDb: any) {
	db = newDb

	db.on('changes', changes => {
		changes.forEach(_ => {
			// console.log(_)
			updateVersionFn()
		})
	})
}

export function getDB(): JahminDb {
	return db
}
