import sharp from 'sharp'
import fs from 'fs'
import { parentPort } from 'worker_threads'
import { mkdirSync, readFileSync } from 'original-fs'

import spark from 'spark-md5'

type DataType = {
	id: string
	elementId: string
	dimension: number
	artInputPath: string
	artOutputDirPath: string
	artOutputPath: string
	success: boolean
}

parentPort?.on('message', (data: DataType) => {
	const { dimension, artInputPath, artOutputDirPath, artOutputPath } = data

	if (!fs.existsSync(artOutputDirPath)) {
		mkdirSync(artOutputDirPath, { recursive: true })
	}

	let file = readFileSync(artInputPath)

	sharp(file)
		.resize({
			height: dimension * 2,
			width: dimension * 2
		})
		.webp({
			quality: 85
		})
		.toFile(artOutputPath)
		.then(() => {
			parentPort?.postMessage(data)
		})
		.catch(err => {
			console.log(err)
			console.log(artInputPath)
		})
})
