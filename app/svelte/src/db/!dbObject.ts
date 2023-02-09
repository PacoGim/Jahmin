import type { SongType } from '../../../types/song.type'
import { songListStore } from '../stores/main.store'
import type { JahminDb } from './!db'
import updateVersionFn from './updateVersion.fn'

let db: any = undefined

export function setDB(newDb: any) {
	db = newDb

	db.on('changes', changes => {
		changes.forEach(_ => {
			if (_.type === 2) {
				// updateData(_.obj)
			} else {
				updateVersionFn()
			}
		})
	})
}

function updateData(newObjet: SongType) {
	let songListStoreLocal: SongType[] = undefined

	songListStore.subscribe(value => (songListStoreLocal = value))()

	let songIndex = songListStoreLocal.findIndex(song => newObjet.ID === song.ID)

	songListStoreLocal[songIndex] = newObjet

	songListStore.set(songListStoreLocal)

	updateVersionFn()
}

export function getDB(): JahminDb {
	return db
}
