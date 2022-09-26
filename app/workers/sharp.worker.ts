import { parentPort } from 'worker_threads'

import sharp from 'sharp'

import typeOfFn from '../functions/typeOf.fn'

let sharpQueue: { artData: string; artPath: string; elementId: string; size: number }[] = []
let isSharpQueueRunning = false

parentPort?.on('message', (data: any) => {
	sharpQueue.push(data)

	if (isSharpQueueRunning === true) {
		return
	} else {
		isSharpQueueRunning = true
		compressImage()
	}
})

function compressImage() {
	parentPort?.postMessage({
		type: 'artQueueLength',
		data: sharpQueue.length
	})

	let task = sharpQueue.shift()

	if (task === undefined) {
		isSharpQueueRunning = false
		return
	}

	const { artData, artPath, elementId, size } = task

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
			setTimeout(() => compressImage(), 100)
			parentPort?.postMessage({
				type: 'imageCompression',
				data: task
			})
		})
		.catch((err: any) => {
			console.log(err)
		})
}
