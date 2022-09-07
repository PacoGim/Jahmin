import fs from 'fs'
import path from 'path'

import mm from 'music-metadata'
import sharp from 'sharp'

import { Worker } from 'worker_threads'

import getAppDataPathFn from '../functions/getAppDataPath.fn'
import getDirectoryFn from '../functions/getDirectory.fn'
import getArrayBufferHashFn from '../functions/getArrayBufferHash.fn'
import hashStringFn from '../functions/hashString.fn'
import { getWorker } from './workers.service'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import getAllFilesInFoldersDeep from '../functions/getAllFilesInFoldersDeep.fn'

const validFormats = ['mp4', 'webm', 'apng', 'avif', 'webp', 'gif', 'svg', 'png', 'jpg', 'jpeg']
const validNames = ['cover', 'folder', 'front', 'art', 'album']
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()
const extensionsToCompress = ['jpg', 'jpeg', 'png']

let sharpWorker: Worker

getWorker('sharp').then(worker => {
	if (!sharpWorker) {
		sharpWorker = worker

		sharpWorker.on('message', handleWorkerResponse)
	}
})

function handleWorkerResponse(data: any) {
	delete data.artData

	sendWebContentsFn('new-art', data)
}

export function handleArtService(filePath: string, elementId: string, size: number) {
	if (isNaN(size) || !filePath || !elementId) return

	const isDirectory = fs.statSync(filePath).isDirectory()

	// If it is a file
	if (!isDirectory) {
		handleFileArt(filePath, elementId, size)
	} else {
		handleFolderArt(filePath, elementId, size)
	}
}

function handleFolderArt(folderPath: string, elementId: string, size: number) {
	let albumId = hashStringFn(folderPath) as string

	let artOutputDirPath = path.join(getAppDataPathFn(), 'arts', String(size))
	let artOutputPath = path.join(artOutputDirPath, albumId) + '.avif'

	if (!fs.existsSync(artOutputDirPath)) fs.mkdirSync(artOutputDirPath, { recursive: true })

	if (fs.existsSync(artOutputPath)) {
		sendWebContentsFn('new-art', {
			artPath: artOutputPath,
			elementId,
			size
		})
		return
	}

	let allowedMediaFile =
		getAllowedFiles(folderPath).sort((fileA, fileB) => fs.statSync(fileB).size - fs.statSync(fileA).size)[0] || undefined

	if (!allowedMediaFile) return

	sendWebContentsFn('new-art', {
		artPath: allowedMediaFile,
		elementId,
		size
	})

	let extension = getExtension(allowedMediaFile)

	if (extensionsToCompress.includes(extension)) {
		compressArt(allowedMediaFile, artOutputPath, elementId, size)
	}
}

function handleFileArt(filePath: string, elementId: string, size: number) {
	const fileNameHash = hashStringFn(filePath) as string
	const embeddedArtDirectory = path.join(getAppDataPathFn(), 'arts', 'embedded', String(size))

	if (!fs.existsSync(embeddedArtDirectory)) fs.mkdirSync(embeddedArtDirectory, { recursive: true })

	let embeddedArtPath =
		getAllFilesInFoldersDeep([embeddedArtDirectory])
			.filter(file => !file.endsWith('.avif'))
			.filter(file => !file.endsWith('.DS_Store'))
			.filter(file => file.endsWith(fileNameHash))[0] || undefined

	if (embeddedArtPath) {
		let finalArtPath = path.join(getDirectoryFn(embeddedArtPath), 'cover.avif')

		if (fs.existsSync(finalArtPath)) {
			sendWebContentsFn('new-art', {
				artPath: finalArtPath,
				elementId,
				size
			})
		}
	}

	mm.parseFile(filePath).then(({ common }) => {
		const cover = mm.selectCover(common.picture)

		if (cover === null) {
			return handleArtService(getDirectoryFn(filePath), elementId, size)
		}

		const artHash = getArrayBufferHashFn(cover.data)
		const artDirectory = path.join(embeddedArtDirectory, artHash)

		if (!fs.existsSync(artDirectory)) fs.mkdirSync(artDirectory, { recursive: true })

		// If the art is the same as the one saved it was already sent before
		if (embeddedArtPath?.split('/').at(-1)?.split('.')[0] === artHash) {
			return
		} else {
			if (embeddedArtPath) {
				fs.rmSync(getDirectoryFn(embeddedArtPath), { recursive: true })
			}
		}

		compressArt(cover.data, path.join(artDirectory, 'cover.avif'), elementId, size)

		fs.writeFileSync(path.join(artDirectory, `${artHash}.${fileNameHash}`), '')
	})
}

function compressArt(artData: Buffer | string, artPath: string, elementId: string, size: number) {
	sharpWorker.postMessage({
		artData,
		artPath,
		elementId,
		size
	})
}

// Returns all images sorted by priority.
export function getAllowedFiles(rootDir: string) {
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

	return allowedMediaFiles
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}
