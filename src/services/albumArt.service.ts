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

// let sendArtQueueProgressInterval: NodeJS.Timeout | null = null

let maxCompressImageQueueLength = 0

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

export function compressAlbumArt(albumId: string, artSizes: number[], forceNewCheck: boolean) {
	return new Promise((resolve, reject) => {
		artSizes = filterNumbers(artSizes)

		let album = getStorageMap().get(albumId)

		// If album is not found, return.
		if (!album) return resolve(undefined)

		artSizes.forEach(artSize => {
			let artOutputDirPath = path.join(appDataPath(), 'art', String(artSize))
			let artOutputPath = path.join(artOutputDirPath, albumId) + '.webp'

			if (forceNewCheck === false && fs.existsSync(artOutputPath)) {
				return sendWebContents('new-art', {
					artSize,
					success: true,
					albumId,
					artPath: artOutputPath,
					fileType: 'image'
				})
			}
		})
	})
}

/**
 * @param {number} arrayToFilter
 * @returns Filtered array.
 * @description Removes all sizes that are not numbers, then changes the type to number.
 */
function filterNumbers(arrayToFilter: any[]) {
	return arrayToFilter.filter(value => !isNaN(Number(value))).map(value => Number(value))
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
