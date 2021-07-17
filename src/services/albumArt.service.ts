import fs from 'fs'
import path from 'path'

import sharp from 'sharp'

import { appDataPath } from '..'
import { mkdirSync } from 'original-fs'
import { getConfig } from './config.service'
import { hash } from '../functions/hashString.fn'

export function getAlbumCover(rootDir: string, forceImage: boolean = false): Promise<{ fileType: string; filePath: string }> {
	return new Promise((resolve, reject) => {
		let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg']
		const notCompress = ['mp4', 'webm', 'apng', 'gif']
		const videoFormats = ['mp4', 'webm']
		const validNames = ['cover', 'folder', 'front', 'art']

		if (forceImage === true) {
			validFormats = validFormats.filter((format) => !videoFormats.includes(format))
		}

		const allowedNames = validNames.map((name) => validFormats.map((ext) => `${name}.${ext}`)).flat()

		let rootDirHashed = hash(rootDir, 'text') as string
		let config = getConfig()
		let dimension = config?.art?.dimension || 128
		let artDirPath = path.join(appDataPath(), 'art', String(dimension))
		let artFilePath = path.join(artDirPath, rootDirHashed) + '.webp'

		// If exists resolve right now the already compressed IMAGE ART
		if (fs.existsSync(artFilePath)) {
			return resolve({ fileType: 'image', filePath: artFilePath })
		}

		let allowedMediaFiles = fs
			.readdirSync(rootDir)
			.filter((file) => allowedNames.includes(file))
			.map((file) => path.join(rootDir, file))
			.sort((a, b) => {
				// Gets the priority from the index of the valid formats above.
				// mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
				let aExtension = validFormats.indexOf(getExtension(a))
				let bExtension = validFormats.indexOf(getExtension(b))

				return aExtension - bExtension
			})

		if (allowedMediaFiles.length === 0) {
			return resolve(null)
		}

		let preferredArt = allowedMediaFiles[0]

		if (videoFormats.includes(getExtension(preferredArt))) {
			resolve({ fileType: 'video', filePath: preferredArt })
		} else {
			resolve({ fileType: 'image', filePath: preferredArt })

			if (forceImage === false && !notCompress.includes(getExtension(preferredArt))) {
				compressImage(preferredArt, artDirPath, artFilePath)
			}
		}
	})
}

function compressImage(filePath: string, artDirPath: string, artPath: string) {
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
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}
