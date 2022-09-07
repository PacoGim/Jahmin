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

const validFormats = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'webp', 'mp4', 'webm']
const validNames = ['cover', 'folder', 'front', 'art', 'album']
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()
const compress = ['jpg', 'jpeg', 'png']
const videoFormats = ['mp4', 'webm']

let sharpWorker: Worker

getWorker('sharp').then(worker => {
	sharpWorker = worker

	sharpWorker.on('message', handleWorkerResponse)
})

function handleWorkerResponse(data: any) {
	// console.log('Worker Response', data)
	sendWebContentsFn('new-art', data)
}

export function handleArtService(filePath: string, elementId: string, size: number) {
	if (isNaN(size) || !filePath || !elementId) return

	const isDirectory = fs.statSync(filePath).isDirectory()

	const artDirectory = path.join(getAppDataPathFn(), 'arts', `${isDirectory ? '' : 'embedded'}`, String(size))

	if (!fs.existsSync(artDirectory)) fs.mkdirSync(artDirectory, { recursive: true })

	// If it is a file
	if (!isDirectory) {
		handleFileArt(filePath, artDirectory, elementId, size)
	}

	/*
				Folder art (url is to directory):
					How to save:

					How to recover:


	*/
}

function handleFileArt(filePath: string, artDirectory: string, elementId: string, size: number) {
	mm.parseFile(filePath).then(({ common }) => {
		const cover = mm.selectCover(common.picture)

		if (cover === null) {
			return handleArtService(getDirectoryFn(filePath), elementId, size)
		}

		let artHash = getArrayBufferHashFn(cover.data)
		let fileNameHash = hashStringFn(filePath)

		compressArt(cover.data, path.join(artDirectory, `${artHash}.avif`), elementId, size)

		fs.writeFileSync(path.join(artDirectory, `${artHash}.${fileNameHash}`), '')
	})

	/*
			arts/embedded/64
				28fjf2309123.jpg (Shared cover)
				28fjf2309123.12390viwoivu3283y4o.txt (For this file get that image)
				28fjf2309123.3094yg3fuii287deqqe.txt (For this file get that image)
				28fjf2309123.3op9ug0943jfphsa2vf.txt (For this file get that image)

			Single song art (url is to file):
				How to save:
					Get the embedded image from file
						· Send to renderer (end)

						·	Hash the image
							Compress the image
							Save it as hashed file path + hashed image
							Send to renderer (end)


				How to recover:
					Hash the file name
					Iterate through every embedded images and find the one that includes the hashed
					Get the image file name
					Get the image and send it to renderer (end)

					Get the embeded image from file
					Hash the image
					Check if hash matches with file name
					If hash doesn't match
					Compress the image
					Delete all other instances of the image
					Save it as hashed file path + hashed image
					Send to renderer (end)

*/
}

function handleFolderArt(filePath: string, artDirectory: string, elementId: string, size: number) {}

function compressArt(artData: Buffer | string, artPath: string, elementId: string, size: number) {
	sharpWorker.postMessage({
		artData,
		artPath,
		elementId,
		size
	})
}
