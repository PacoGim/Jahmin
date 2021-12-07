import fs from 'fs'
import path from 'path'

import { appDataPath } from '..'
import { getConfig } from './config.service'
import { sendWebContents } from './sendWebContents.service'
import { getStorageMap } from './storage.service'
import { getWorker } from './worker.service'
import { AlbumType } from '../types/album.type'

// Queue for image compression
let compressImageQueue: {
	albumId: string
	elementId: string | null
	dimension: number
	artInputPath: string
	artOutputDirPath: string
	artOutputPath: string
}[] = []

let isQueueRuning = false

let sharpWorker = getWorker('sharp')!

sharpWorker.on('message', data => {
	data.artInputPath = data.artOutputPath
	data.success = true
	data.artSize = data.dimension
	data.fileType = 'image'
	delete data.artOutputDirPath
	delete data.artOutputPath
	delete data.dimension

	sendWebContents('new-art', data)

	setTimeout(() => {
		runQueue()
	}, 100)
})

let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg']
const validNames = ['cover', 'folder', 'front', 'art', 'album']
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()
const notCompress = ['mp4', 'webm', 'apng', 'gif']
const videoFormats = ['mp4', 'webm']

export function getAlbumArt(
	albumId: string,
	artSize: number | null,
	elementId: string | null,
	forceImage: boolean = false
): Promise<{ fileType: string; filePath: string; isNew: boolean } | undefined> {
	return new Promise((resolve, reject) => {
		let album = getStorageMap().get(albumId)

		if (!album) {
			return resolve(undefined)
		}

		if (forceImage === true) {
			validFormats = validFormats.filter(format => !videoFormats.includes(format))
		}

		let config = getConfig()
		let dimension = artSize || config?.userOptions?.artSize || 128
		let artOutputDirPath = path.join(appDataPath(), 'art', String(dimension))
		let artOutputPath = path.join(artOutputDirPath, albumId) + '.webp'

		// If exists resolve right now the already compressed IMAGE ART
		if (fs.existsSync(artOutputPath)) {
			return sendWebContents('new-art', {
				artSize,
				success: true,
				albumId,
				artInputPath: artOutputPath,
				fileType: 'image',
				elementId
			})
		}

		if (fs.existsSync(album.RootDir) === false) {
			return resolve(undefined)
		}

		let allowedMediaFiles = getAllowedFiles(album)

		if (allowedMediaFiles.length === 0) {
			sendWebContents('new-art', {
				artSize,
				success: false,
				elementId
			})
			return resolve(undefined)
		}

		let artInputPath = allowedMediaFiles[0]

		// Resolves the best image/video found first, then it will be compressed and sent to renderer.
		if (videoFormats.includes(getExtension(artInputPath))) {
			sendWebContents('new-art', {
				artSize,
				success: true,
				albumId,
				artInputPath,
				fileType: 'video',
				elementId
			})

			artInputPath = allowedMediaFiles.filter(file => !notCompress.includes(getExtension(file)))[0]

			if (artInputPath !== undefined) {
				sendWebContents('new-art', {
					artSize,
					success: true,
					albumId,
					artInputPath,
					fileType: 'image',
					elementId
				})
			}
		} else {
			sendWebContents('new-art', {
				artSize,
				success: true,
				albumId,
				artInputPath,
				fileType: 'image',
				elementId
			})

			if (forceImage === false && !notCompress.includes(getExtension(artInputPath))) {
				compressImageQueue.unshift({
					albumId,
					elementId,
					dimension,
					artInputPath,
					artOutputDirPath,
					artOutputPath
				})

				if (isQueueRuning === false) {
					isQueueRuning = true
					runQueue()
				}
			}
		}
	})
}

function runQueue() {
	let task = compressImageQueue.shift()

	if (task === undefined) {
		isQueueRuning = false
		return
	}

	sharpWorker.postMessage(task)
}

export function getAllowedFiles(album: AlbumType) {
	let allowedMediaFiles = fs
		.readdirSync(album.RootDir)
		.filter(file => allowedNames.includes(file.toLowerCase()))
		.map(file => path.join(album!.RootDir, file))
		.sort((a, b) => {
			// Gets the priority from the index of the valid formats above.
			// mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
			let aExtension = validFormats.indexOf(getExtension(a))
			let bExtension = validFormats.indexOf(getExtension(b))

			return aExtension - bExtension
		})

	return allowedMediaFiles
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}
