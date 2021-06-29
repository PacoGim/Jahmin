import path from 'path'
import fs from 'fs'

import chokidar from 'chokidar'

import { appDataPath } from '..'

import { AlbumType } from '../types/album.type'
import { hash } from '../functions/hashString.fn'
import { SongType } from '../types/song.type'
import { getWorker } from './worker.service'

const STORAGE_PATH = path.join(appDataPath(), 'storage')
const STORAGE_VERSION_FILE_PATH = path.join(STORAGE_PATH, 'version')

let storageMap: Map<String, AlbumType> = new Map<String, AlbumType>()
// let storageVersion: number

// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve: any = undefined

let watcher: chokidar.FSWatcher

let worker = getWorker('storage')

worker?.on('message', (message) => {
	if (message.type === 'Add') {
		addData(message.data)
	} else if (message.type === 'Update') {
		updateData(message.data)
	}
})

function updateData(songData: SongType) {
	// TODO Logic
}

function addData(songData: SongType) {
	let rootDir = songData.SourceFile.split('/').slice(0, -1).join('/')
	let rootId = hash(rootDir, 'text') as string

	let mappedData = storageMap.get(rootId)

	if (mappedData) {
		mappedData?.Songs.push(songData)
	} else {
		storageMap.set(rootId, {
			ID: rootId,
			RootDir: rootDir,
			Name: songData.Album || '',
			Songs: [songData]
		})
	}

	if (dbVersionResolve !== undefined) dbVersionResolve(new Date().getTime())
}

function consolidateStorage() {
	console.log('Consolidating...')
	if (!fs.existsSync(STORAGE_PATH)) {
		fs.mkdirSync(STORAGE_PATH)
	}

	let storageFiles = fs.readdirSync(STORAGE_PATH).filter((file) => {
		if (['.DS_Store', 'version'].includes(file)) {
			return false
		} else {
			return file.indexOf('.tmp-') === -1
		}
	})

	storageFiles.forEach((file) => {
		let fileData = JSON.parse(fs.readFileSync(path.join(STORAGE_PATH, file), { encoding: 'utf-8' }))

		for (let songId in fileData) {
			let song = fileData[songId]

			let rootDir = song.SourceFile.split('/').slice(0, -1).join('/')
			let rootId = hash(rootDir, 'text') as string

			let data = storageMap.get(rootId)

			if (data) {
				if (!data.Songs.find((i) => i.ID === song.ID)) {
					data.Songs.push(song)

					storageMap.set(rootId, data)
				}
			} else {
				storageMap.set(rootId, {
					ID: rootId,
					RootDir: rootDir,
					Name: song.Album,
					Songs: [song]
				})
			}
		}
	})

	// storageMap = map
	// return map
}

export function getStorageMapToArray() {
	let map = getStorageMap()
	let array: SongType[] = []

	map.forEach((album) => {
		array = array.concat(album.Songs)
	})

	return array
}

export function getNewPromiseDbVersion(rendererDbVersion: number): Promise<number> {
	let dbFileTimeStamp = getStorageVersion()

	// If the db version changed while going back and forth Main <-> Renderer
	if (dbFileTimeStamp > rendererDbVersion) {
		return new Promise((resolve) => resolve(dbFileTimeStamp))
	} else {
		// If didn't change, wait for a change to happen.
		return new Promise((resolve) => (dbVersionResolve = resolve))
	}
}

/*
function watchVersionFile() {
	if (!fs.existsSync(STORAGE_VERSION_FILE_PATH)) {
		fs.writeFileSync(STORAGE_VERSION_FILE_PATH, '0')
	}

	watcher = chokidar.watch(path.join(STORAGE_PATH, 'version')).on('change', () => {
		dbVersionResolve(getStorageVersion())
	})
}
*/

export function updateStorageVersion() {
	fs.writeFileSync(STORAGE_VERSION_FILE_PATH, String(new Date().getTime()))
}

export function killStorageWatcher() {
	if (watcher) {
		watcher.close()
	}
}

export function initStorage() {
	consolidateStorage()
	// watchVersionFile()
}

function getStorageVersion() {
	try {
		return Number(fs.readFileSync(path.join(STORAGE_PATH, 'version'), { encoding: 'utf8' }))
	} catch (error) {
		return 0
	}
}

export function getStorageMap() {
	return storageMap
}
