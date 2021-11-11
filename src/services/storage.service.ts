import path from 'path'
import fs from 'fs'

import chokidar from 'chokidar'

import { appDataPath } from '..'

import { AlbumType } from '../types/album.type'
import { hash } from '../functions/hashString.fn'
import { SongType } from '../types/song.type'
import { getWorker } from './worker.service'
import generateId from '../functions/generateId.fn'

const STORAGE_PATH = path.join(appDataPath(), 'storage')
const STORAGE_VERSION_FILE_PATH = path.join(STORAGE_PATH, 'version')

let storageMap: Map<String, AlbumType> = new Map<String, AlbumType>()
// let storageVersion: number

// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve: any = undefined

let watcher: chokidar.FSWatcher

let worker = getWorker('storage')

worker?.on('message', message => {
	if (message.type === 'insert') {
		insertData(message.data)
	} else if (message.type === 'update') {
		updateData(message.data)
	} else if (message.type === 'delete') {
		deleteData(message.data)
	} else if (message.type === 'deleteFolder') {
		deleteFolder(message.data)
	}

	updateStorageVersion()
})

function deleteFolder(rootDir: string) {
	let rootId = hash(rootDir, 'text') as string

	let mappedData = storageMap.get(rootId)

	if (mappedData) {
		storageMap.delete(rootId)
		if (dbVersionResolve !== undefined) dbVersionResolve(generateId())
	}
}

function deleteData(songPath: string) {
	let rootDir = songPath.split('/').slice(0, -1).join('/')
	let rootId = hash(rootDir, 'text') as string
	let songId = hash(songPath, 'number')

	let mappedData = storageMap.get(rootId)

	let songs = mappedData?.Songs

	if (mappedData && songs) {
		songs = songs.filter(song => song.ID !== songId)

		mappedData.Songs = songs
		storageMap.set(rootDir, mappedData)

		// If all songs removed from drive, then, delete the album and all data from map.
		if (songs.length === 0) {
			storageMap.delete(rootDir)
		}

		if (dbVersionResolve !== undefined) dbVersionResolve(generateId())
	}
}

function updateData(songData: SongType) {
	if (songData?.SourceFile === undefined) {
		return
	}

	let rootDir = songData.SourceFile.split('/').slice(0, -1).join('/')
	let rootId = hash(rootDir, 'text') as string
	let songId = hash(songData.SourceFile, 'number')

	let mappedData = storageMap.get(rootId)

	let songs = mappedData?.Songs

	if (mappedData && songs) {
		let songIndex = songs.findIndex(song => song.ID === songId)
		songs[songIndex] = songData
		mappedData.Songs = songs
		storageMap.set(rootDir, mappedData)

		if (dbVersionResolve !== undefined) dbVersionResolve(generateId())
	}
}

function insertData(songData: SongType) {
	if (songData === undefined) {
		return
	}

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

	if (dbVersionResolve !== undefined) dbVersionResolve(generateId())
}

let fuzzyArray: (string | undefined)[] = []

function consolidateStorage() {
	if (!fs.existsSync(STORAGE_PATH)) {
		fs.mkdirSync(STORAGE_PATH)
	}

	let storageFiles = fs.readdirSync(STORAGE_PATH).filter(file => {
		if (['.DS_Store', 'version'].includes(file)) {
			return false
		} else {
			return file.indexOf('.tmp-') === -1
		}
	})

	storageFiles.forEach(file => {
		let fileData = JSON.parse(fs.readFileSync(path.join(STORAGE_PATH, file), { encoding: 'utf-8' }))

		for (let songId in fileData) {
			let song = fileData[songId]

			let rootDir = song.SourceFile.split('/').slice(0, -1).join('/')
			let rootId = hash(rootDir, 'text') as string

			let data = storageMap.get(rootId)

			if (data) {
				if (!data.Songs.find(i => i.ID === song.ID)) {
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
}

export function getFuzzyList() {
	return fuzzyArray
}

export function getStorageMapToArray() {
	let map = getStorageMap()
	let array: SongType[] = []

	map.forEach(album => {
		array = array.concat(album.Songs)
	})

	return array
}

export function getNewPromiseDbVersion(rendererDbVersion: string): Promise<string> {
	let dbFileTimeStamp = getStorageVersion()

	// If the db version changed while going back and forth Main <-> Renderer
	if (rendererDbVersion !== dbFileTimeStamp) {
		return new Promise(resolve => resolve(dbFileTimeStamp))
	} else {
		// If didn't change, wait for a change to happen.
		return new Promise(resolve => (dbVersionResolve = resolve))
	}
}

function updateStorageVersion() {
	fs.writeFileSync(STORAGE_VERSION_FILE_PATH, generateId(), { encoding: 'utf-8' })
}

export function killStorageWatcher() {
	if (watcher) {
		watcher.close()
	}
}

export function initStorage() {
	consolidateStorage()
}

function getStorageVersion() {
	try {
		return fs.readFileSync(path.join(STORAGE_PATH, 'version'), { encoding: 'utf8' })
	} catch (error) {
		return ''
	}
}

export function getStorageMap() {
	return storageMap
}
