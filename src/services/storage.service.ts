import path from 'path'
import fs from 'fs'

import { appDataPath } from '..'

import { AlbumType } from '../types/album.type'
import { hash } from '../functions/hashString.fn'
import { SongType } from '../types/song.type'

const STORAGE_PATH = path.join(appDataPath(), 'storage')

let storageMap: Map<String, AlbumType>
let storageVersion: number

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

export function consolidateStorage() {
	let map = new Map<String, AlbumType>()

	if (!fs.existsSync(STORAGE_PATH)) {
		fs.mkdirSync(STORAGE_PATH)
	}

	let storageFiles = fs.readdirSync(STORAGE_PATH).filter((file) => !['.DS_Store', 'version'].includes(file))

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
