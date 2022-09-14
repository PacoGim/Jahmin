import { parentPort } from 'worker_threads'

import sharp from 'sharp'

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
		.webp({
			quality: 82
		})
		.toFile(artPath)
		.then(() => {
			parentPort?.postMessage(data)
		})
		.catch((err: any) => {
			console.log(err)
		})
})
