import fs from 'fs'
import path from 'path'

import mm from 'music-metadata'

import getFileExtensionFn from '../functions/getFileExtension.fn'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'
import { sendWebContents } from './sendWebContents.service'
import sharp from 'sharp'

export default function (url: string, artSize: string, albumId: string) {
	if (!fs.existsSync(url)) {
		return
	}

	let pathStats = fs.statSync(url)

	if (pathStats.isDirectory()) {
		let firstValidFileFound = fs
			.readdirSync(url)
			.find(file => allowedSongExtensionsVar.includes(getFileExtensionFn(file) || ''))

		if (firstValidFileFound) {
			url = path.join(url, firstValidFileFound)
		}
	}

	if (!fs.existsSync(url)) {
		return
	}

	getCover(url, Number(artSize)).then(base64Cover => {
		sendWebContents('send-single-songArt', {
			albumId,
			artSize,
			cover: base64Cover
		})
	})
}

function getCover(url: string, artSize: number) {
	return new Promise((resolve, reject) => {
		mm.parseFile(url).then(({ common }) => {
			const cover = mm.selectCover(common.picture) // pick the cover image

			if (cover === null) {
				resolve(null)
			} else {
				sharp(cover?.data)
					.resize({
						height: artSize * 2,
						width: artSize * 2
					})
					.webp({
						quality: 85
					})
					.toBuffer()
					.then(buffer => {
						resolve(`data:image/webp;base64,${buffer.toString('base64')}`)
					})
			}
		})
	})
}
