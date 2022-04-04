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
	dimension: number
	artInputPath: string
	artOutputDirPath: string
	artOutputPath: string
}[] = []

// let sendArtQueueProgressInterval: NodeJS.Timeout | null = null

let maxCompressImageQueueLength = 0

let isQueueRuning = false

let sharpWorker = getWorker('sharp')!

sharpWorker.on('message', data => {
	data.artPath = data.artOutputPath
	data.success = true
	data.artSize = data.dimension
	data.artType = 'image'
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

export function compressAlbumArt(albumId: string, artSize: number, forceNewCheck: boolean) {
	// If the art size is not a number, it can't compress the art so it returns.
	if (isNaN(Number(artSize))) return

	let album = getStorageMap().get(albumId)

	// If album is not found, return.
	if (album === undefined) return

	let artOutputDirPath = path.join(appDataPath(), 'art', String(artSize))
	let artOutputPath = path.join(artOutputDirPath, albumId) + '.webp'

	// Send image if already compressed and a forced new check is set to false.
	if (forceNewCheck === false && fs.existsSync(artOutputPath)) {
		return sendWebContents('new-art', {
			artSize,
			success: true,
			albumId,
			artPath: artOutputPath,
			artType: 'image'
		})
	}

	// If album root directory is not found, return.
	if (fs.existsSync(album.RootDir) === false) return

	let allowedMediaFiles = getAllowedFiles(album)

	if (allowedMediaFiles.length === 0) {
		sendWebContents('new-art', {
			artSize,
			success: false,
			albumId
		})
		return
	}

	let artInputPath = allowedMediaFiles[0]

	// If video found.
	if (videoFormats.includes(getExtension(artInputPath))) {
		sendWebContents('new-art', {
			artSize,
			success: true,
			albumId,
			artPath: artInputPath,
			artType: 'video'
		})

		// Finds a cover that is not a video to compress it.
		artInputPath = allowedMediaFiles.filter(file => !notCompress.includes(getExtension(file)))[0]

		if (artInputPath !== undefined) {
			sendWebContents('new-art', {
				artSize,
				success: false,
				albumId,
				artPath: artInputPath,
				artType: 'image'
			})
		}
	} else {
		// Send the first image found uncompressed.
		sendWebContents('new-art', {
			artSize,
			success: true,
			albumId,
			artPath: artInputPath,
			artType: 'image'
		})

		if (!notCompress.includes(getExtension(artInputPath))) {
			compressImageQueue.unshift({
				albumId,
				dimension: artSize,
				artInputPath,
				artOutputDirPath,
				artOutputPath
			})

			if (compressImageQueue.length > maxCompressImageQueueLength) {
				maxCompressImageQueueLength = compressImageQueue.length
			}

			if (isQueueRuning === false) {
				isQueueRuning = true
				sendArtQueueProgress()
				runQueue()
			}
		}
	}
}

function runQueue() {
	let task = compressImageQueue.shift()

	if (task === undefined) {
		isQueueRuning = false
		return
	}
	sharpWorker.postMessage(task)
}

export function sendArtQueueProgress() {
	if (compressImageQueue.length === 0) {
		maxCompressImageQueueLength = 0
	}

	sendWebContents('art-queue-progress', {
		currentLength: compressImageQueue.length,
		maxLength: maxCompressImageQueueLength
	})
}

// Returns all images sorted by priority.
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
