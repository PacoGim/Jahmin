import path from 'path'
import fs from 'fs'

import chokidar from 'chokidar'

import { appDataPath } from '..'

import { AlbumType } from '../types/album.type'
import { hash } from '../functions/hashString.fn'
import { SongType } from '../types/song.type'

const STORAGE_PATH = path.join(appDataPath(), 'storage')
const STORAGE_VERSION_FILE_PATH = path.join(STORAGE_PATH, 'version')

let storageMap: Map<String, AlbumType>
let storageVersion: number

// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve: any = undefined

let watcher: chokidar.FSWatcher

function watchVersionFile() {
	if (!fs.existsSync(STORAGE_VERSION_FILE_PATH)) {
		fs.writeFileSync(STORAGE_VERSION_FILE_PATH, '0')
	}

	watcher = chokidar.watch(path.join(STORAGE_PATH, 'version')).on('change', () => {
		dbVersionResolve(storageVersion)
	})
}

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
	watchVersionFile()
}

export function getStorageMapToArray() {
	let map = getStorageMap()
	let array: SongType[] = []

	map.forEach((album) => {
		array = array.concat(album.Songs)
	})

	return array
}

export function getStorageMap() {
	let version = getStorageVersion()

	if (version !== storageVersion) {
		storageVersion = version
		return consolidateStorage()
	} else {
		return storageMap
	}
}

function consolidateStorage() {
	let map = new Map<String, AlbumType>()

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

			let data = map.get(rootId)

			if (data) {
				if (!data.Songs.find((i) => i.ID === song.ID)) {
					data.Songs.push(song)

					map.set(rootId, data)
				}
			} else {
				map.set(rootId, {
					ID: rootId,
					RootDir: rootDir,
					Name: song.Album,
					Songs: [song]
				})
			}
		}
	})

	storageMap = map
	return map
}

function getStorageVersion() {
	return Number(fs.readFileSync(path.join(STORAGE_PATH, 'version'), { encoding: 'utf8' }))
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
