import sharp from 'sharp'
import fs from 'fs'
import { parentPort } from 'worker_threads'
import { mkdirSync } from 'original-fs'

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

	sharp(artInputPath)
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
