import fs from 'fs'
import pathModule from 'path'

import mm from 'music-metadata'

import getFileExtensionFn from '../functions/getFileExtension.fn'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'
import { sendWebContents } from '../functions/sendWebContents.fn'
import sharp from 'sharp'

export default function (path: string, artSize: string, albumId: string) {
	// If path does not exist
	if (!fs.existsSync(path)) {
		return
	}

	let pathStats = fs.statSync(path)

	// if the given path is a directory
	if (pathStats.isDirectory()) {
		// Find the first valid song in the directory
		let firstValidFileFound = fs
			.readdirSync(path)
			.find(file => allowedSongExtensionsVar.includes(getFileExtensionFn(file) || ''))

		// If a valid song is found
		if (firstValidFileFound) {
			// Get its path
			path = pathModule.join(path, firstValidFileFound)
		}
	}

	// Check again if the path exists
	if (!fs.existsSync(path)) {
		return
	}

	// Gets a Base64 version of the array buffer of the song found
	getCover(path, Number(artSize)).then(base64Cover => {
		sendWebContents('send-single-songArt', {
			albumId,
			artSize,
			cover: base64Cover
		})
	})
}

function getCover(url: string, artSize: number) {
	return new Promise((resolve, reject) => {
		// Gets the song metadata
		mm.parseFile(url).then(({ common }) => {
			// Gets the album art image
			const cover = mm.selectCover(common.picture) // pick the cover image

			// If no album art found, resolve null
			if (cover === null) {
				resolve(null)
			} else {
				// If an album art is found...
				sharp(cover?.data)
					// Resize it...
					.resize({
						height: artSize * 2,
						width: artSize * 2
					})
					// Convert it to webp...
					.webp({
						quality: 85
					})
					// Into a buffer...
					.toBuffer()
					// Then resolve the Base64 version of the buffer
					.then(buffer => {
						resolve(`data:image/webp;base64,${buffer.toString('base64')}`)
					})
			}
		})
	})
}
