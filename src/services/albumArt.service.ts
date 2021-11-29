import fs from 'fs'
import path from 'path'

import sharp from 'sharp'

import { appDataPath } from '..'
import { mkdirSync } from 'original-fs'
import { getConfig } from './config.service'
import { hash } from '../functions/hashString.fn'
import { sendWebContents } from './sendWebContents.service'
import { getStorageMap, getStorageMapToArray } from './storage.service'

export function getAlbumArt(
	albumId: string,
	artSize: number | null,
	elementId: string | null,
	forceImage: boolean = false,
	forceNewImage: boolean = false
): Promise<{ fileType: string; filePath: string; isNew: boolean } | undefined> {
	return new Promise((resolve, reject) => {
		let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg']
		const notCompress = ['mp4', 'webm', 'apng', 'gif']
		const videoFormats = ['mp4', 'webm']
		const validNames = ['cover', 'folder', 'front', 'art', 'album']

		let album = getStorageMap().get(albumId)

		if (!album) {
			return resolve(undefined)
		}

		if (forceImage === true) {
			validFormats = validFormats.filter(format => !videoFormats.includes(format))
		}

		const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()

		let rootDirHashed = hash(album.RootDir, 'text') as string
		let config = getConfig()
		let dimension = artSize || config?.art?.dimension || 128
		let artDirPath = path.join(appDataPath(), 'art', String(dimension))
		let artFilePath = path.join(artDirPath, rootDirHashed) + '.webp'

		// If exists resolve right now the already compressed IMAGE ART
		if (forceNewImage === false && fs.existsSync(artFilePath)) {
			return sendWebContents('new-art', {
				artSize,
				success: true,
				id: rootDirHashed,
				filePath: artFilePath,
				fileType: 'image',
				elementId
			})
		}

		if (fs.existsSync(album.RootDir) === false) {
			return resolve(undefined)
		}

		let allowedMediaFiles = fs
			.readdirSync(album.RootDir)
			.filter(file => allowedNames.includes(file.toLowerCase()))
			//@ts-ignore
			.map(file => path.join(album.RootDir, file))
			.sort((a, b) => {
				// Gets the priority from the index of the valid formats above.
				// mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
				let aExtension = validFormats.indexOf(getExtension(a))
				let bExtension = validFormats.indexOf(getExtension(b))

				return aExtension - bExtension
			})

		if (allowedMediaFiles.length === 0) {
			sendWebContents('new-art', {
				artSize,
				success: false,
				elementId
			})
			return resolve(undefined)
		}

		let preferredArtPath = allowedMediaFiles[0]

		if (videoFormats.includes(getExtension(preferredArtPath))) {
			// Resolves the best image/video found first, then it will be compressed and sent to renderer.
			sendWebContents('new-art', {
				artSize,
				success: true,
				id: rootDirHashed,
				filePath: preferredArtPath,
				fileType: 'video',
				elementId
			})
		} else {
			sendWebContents('new-art', {
				artSize,
				success: true,
				id: rootDirHashed,
				filePath: preferredArtPath,
				fileType: 'image',
				elementId
			})

			if (forceImage === false && !notCompress.includes(getExtension(preferredArtPath))) {
				compressImage(dimension, preferredArtPath, artDirPath, artFilePath).then(artPath => {
					sendWebContents('new-art', {
						artSize,
						success: true,
						id: rootDirHashed,
						filePath: artPath,
						fileType: 'image',
						elementId
					})
				})
			}
		}
	})
}

function compressImage(dimension: number, filePath: string, artDirPath: string, artPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(artDirPath)) {
			mkdirSync(artDirPath, { recursive: true })
		}

		sharp(filePath)
			.resize({
				height: dimension * 2,
				width: dimension * 2
			})
			.webp({
				quality: 85
			})
			.toFile(artPath)
			.then(() => {
				resolve(artPath)
			})
			.catch(err => {
				console.log('----------')
				console.log(err)
				console.log(filePath)
				console.log('----------')
			})
	})
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}
