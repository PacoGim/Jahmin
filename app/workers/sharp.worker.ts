const sharp = require('sharp')
import * as fs from 'fs'
import { parentPort } from 'worker_threads'

import typeOfFn from '../functions/typeOf.fn'

parentPort?.on('message', (data: any) => {
	const { artData, artPath, elementId, size } = data

	let sharpData = undefined

	if (typeOfFn(artData) === 'Uint8Array') {
		sharpData = artData
	}

	sharp(artData)
		.resize({
			height: size * 2,
			width: size * 2
		})
		.avif({
			quality: 64
		})
		.toFile(artPath)
		.then(() => {
			parentPort?.postMessage(data)
		})
		.catch((err: any) => {
			console.log(err)
		})
})
