import type { ConfigType } from '../../../types/config.type'
import type { SongType } from '../../../types/song.type'
import getDirectoryFn from '../functions/getDirectory.fn'
import sortSongsArrayFn from '../functions/sortSongsArray.fn'
import { config, selectedAlbumDir, songListStore } from '../stores/main.store'
import type { JahminDb } from './!db'
import updateVersionFn from './updateVersion.fn'

let db: any = undefined
let configLocal: ConfigType = undefined

config.subscribe(value => (configLocal = value))

export function setDB(newDb: any) {
	db = newDb

	db.on('changes', changes => {
		changes.forEach(_ => {
			if (_.type === 2 /* Type 2 === Update */) {
				updateData(_.obj)
			} else if (_.type === 3 /* Type 3 === Delete */) {
				deleteData(_.oldObj)
			} else if (_.type === 1 /* Type 1 === Insert */) {
				insertData(_.obj)
			}
		})
	})
}

function insertData(newObjet: SongType) {
	let selectedAlbumDirLocal = undefined
	let songListStoreLocal = undefined

	selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))()
	songListStore.subscribe(value => (songListStoreLocal = value))()

	if (selectedAlbumDirLocal === getDirectoryFn(newObjet?.SourceFile)) {
		songListStoreLocal.push(newObjet)

		songListStore.set(
			sortSongsArrayFn(songListStoreLocal, configLocal.userOptions.sortBy, configLocal.userOptions.sortOrder, configLocal.group)
		)
	}
}

function deleteData(oldObject: SongType) {
	let selectedAlbumDirLocal = undefined
	let songListStoreLocal: SongType[] = undefined

	selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))()
	songListStore.subscribe(value => (songListStoreLocal = value))()

	if (selectedAlbumDirLocal === getDirectoryFn(oldObject?.SourceFile)) {
		let itemToDeleteIndex = songListStoreLocal.findIndex(song => song.ID === oldObject.ID)

		if (itemToDeleteIndex !== -1) {
			songListStoreLocal.splice(itemToDeleteIndex, 1)
			songListStore.set(songListStoreLocal)
		}
	}
}

function updateData(newObjet: SongType) {
	let songListStoreLocal: SongType[] = undefined

	songListStore.subscribe(value => (songListStoreLocal = value))()

	let songIndex = songListStoreLocal.findIndex(song => newObjet.ID === song.ID)

	songListStoreLocal[songIndex] = newObjet

	songListStore.set(songListStoreLocal)

	// updateVersionFn()
}

export function getDB(): JahminDb {
	return db
}
