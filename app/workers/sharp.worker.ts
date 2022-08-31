const sharp = require('sharp')
import * as fs from 'fs'
import { parentPort } from 'worker_threads'

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
		fs.mkdirSync(artOutputDirPath, { recursive: true })
	}

	let file = fs.readFileSync(artInputPath)

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
		.catch((err: any) => {
			console.log(err)
			console.log(artInputPath)
		})
})
