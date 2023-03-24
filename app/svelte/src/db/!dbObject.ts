import { get } from 'svelte/store'
import type { ConfigType } from '../../../types/config.type'
import type { PartialSongType, SongType } from '../../../types/song.type'
import getDirectoryFn from '../functions/getDirectory.fn'
import sortSongsArrayFn from '../functions/sortSongsArray.fn'
import stopSongFn from '../functions/stopSong.fn'
import { config } from '../stores/config.store'
import { playingSongStore, selectedAlbumDir, songListStore } from '../stores/main.store'
import type { JahminDb } from './!db'

let db: any = undefined
// let configLocal: ConfigType = undefined

// config.subscribe(value => (configLocal = value))

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

	if (selectedAlbumDirLocal === getDirectoryFn(newObjet?.SourceFile)) {
		songListStore.subscribe(value => (songListStoreLocal = value))()
		songListStoreLocal.push(newObjet)

		songListStore.set(
			sortSongsArrayFn(songListStoreLocal, get(config).userOptions.sortBy, get(config).userOptions.sortOrder, get(config).group)
		)
	}
}

function deleteData(oldObject: SongType) {
	let selectedAlbumDirLocal = undefined
	let songListStoreLocal: SongType[] = undefined
	let playingSongLocal: PartialSongType = undefined

	selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))()

	if (selectedAlbumDirLocal === getDirectoryFn(oldObject?.SourceFile)) {
		songListStore.subscribe(value => (songListStoreLocal = value))()

		let itemToDeleteIndex = songListStoreLocal.findIndex(song => song.ID === oldObject.ID)

		if (itemToDeleteIndex !== -1) {
			songListStoreLocal.splice(itemToDeleteIndex, 1)
			songListStore.set(songListStoreLocal)

			playingSongStore.subscribe(value => (playingSongLocal = value))()

			if (oldObject.ID === playingSongLocal?.ID) {
				stopSongFn()
			}
		}
	}
}

function updateData(newObjet: SongType) {
	let songListStoreLocal: SongType[] = undefined
	let selectedAlbumDirLocal = undefined

	selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))()

	if (selectedAlbumDirLocal === getDirectoryFn(newObjet?.SourceFile)) {
		songListStore.subscribe(value => (songListStoreLocal = value))()

		let songIndex = songListStoreLocal.findIndex(song => newObjet.ID === song.ID)

		songListStoreLocal[songIndex] = newObjet

		songListStore.set(
			sortSongsArrayFn(songListStoreLocal, get(config).userOptions.sortBy, get(config).userOptions.sortOrder, get(config).group)
		)
	}
}

export function getDB(): JahminDb {
	return db
}
