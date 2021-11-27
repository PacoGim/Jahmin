import fs from 'fs'
import path from 'path'

import sharp from 'sharp'

import { appDataPath } from '..'
import { mkdirSync } from 'original-fs'
import { getConfig } from './config.service'
import { hash } from '../functions/hashString.fn'
import { sendWebContents } from './sendWebContents.service'

export function getAlbumArt(
	rootDir: string,
	forceImage: boolean = false,
	forceNewImage: boolean = false
): Promise<{ fileType: string; filePath: string; isNew: boolean } | undefined> {
	return new Promise((resolve, reject) => {
		let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg']
		const notCompress = ['mp4', 'webm', 'apng', 'gif']
		const videoFormats = ['mp4', 'webm']
		const validNames = ['cover', 'folder', 'front', 'art', 'album']

		if (forceImage === true) {
			validFormats = validFormats.filter(format => !videoFormats.includes(format))
		}

		const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()

		let rootDirHashed = hash(rootDir, 'text') as string
		let config = getConfig()
		let dimension = config?.art?.dimension || 128
		let artDirPath = path.join(appDataPath(), 'art', String(dimension))
		let artFilePath = path.join(artDirPath, rootDirHashed) + '.webp'

		// If exists resolve right now the already compressed IMAGE ART
		if (forceNewImage === false && fs.existsSync(artFilePath)) {
			return resolve({ fileType: 'image', filePath: artFilePath, isNew: false })
		}

		if (fs.existsSync(rootDir) === false) {
			return resolve(undefined)
		}

		let allowedMediaFiles = fs
			.readdirSync(rootDir)
			.filter(file => allowedNames.includes(file.toLowerCase()))
			.map(file => path.join(rootDir, file))
			.sort((a, b) => {
				// Gets the priority from the index of the valid formats above.
				// mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
				let aExtension = validFormats.indexOf(getExtension(a))
				let bExtension = validFormats.indexOf(getExtension(b))

				return aExtension - bExtension
			})

		if (allowedMediaFiles.length === 0) {
			return resolve(undefined)
		}

		let preferredArt = allowedMediaFiles[0]

		if (videoFormats.includes(getExtension(preferredArt))) {
			// Resolves the best image/video found first, then it will be compressed and sent to renderer.
			resolve({ fileType: 'video', filePath: preferredArt, isNew: true })
		} else {
			resolve({ fileType: 'image', filePath: preferredArt, isNew: true })

			if (forceImage === false && !notCompress.includes(getExtension(preferredArt))) {
				compressImage(preferredArt, artDirPath, artFilePath).then(artPath => {
					sendWebContents('new-art', {
						success: true,
						id: rootDirHashed,
						filePath: artPath,
						fileType: 'image'
					})
				})
			}
		}
	})
}

function compressImage(filePath: string, artDirPath: string, artPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		let config = getConfig()
		let dimension = config?.art?.dimension || 128

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
	})
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}
