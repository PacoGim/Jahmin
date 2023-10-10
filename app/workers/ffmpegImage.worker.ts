import { parentPort } from 'worker_threads'
import { spawn } from 'child_process'
import { join as pathJoin } from 'path'
import getOsFn from '../functions/getOs.fn'
import generateIdFn from '../functions/generateId.fn'
import fs from 'fs'


let ffmpegPath = pathJoin(__dirname, `../../bin/ffmpeg`)

parentPort?.on('message', message => {
	if (message.type === 'handle-art-compression') {
		handleArtCompression(message)
	}

	if (message.type === 'handle-art-color') {
		handleArtColor(message)
	}
})

function handleArtCompression(message: any) {
	let { artPath, elementId, size, appDataPath, type } = message

	let tempFolder = pathJoin(appDataPath, '/temp')

	let id = generateIdFn()

	let tempFilePath = `${tempFolder}/${id}.jpg`

	if (!fs.existsSync(tempFolder)) {
		fs.mkdirSync(tempFolder, { recursive: true })
	}

	spawn(`"${ffmpegPath}" -i "${artPath}" -vf scale=${size * 2}:${size * 2} "${tempFilePath}"`, [], { shell: true }).on(
		'close',
		code => {
			if (code === 1) {
				parentPort?.postMessage({
					artPath,
					elementId,
					type,
					workerCallId: message.workerCallId,
					artAlt: Buffer.from(fs.readFileSync(tempFilePath)).toString('base64')
				})

				setTimeout(() => {
					fs.unlink(tempFilePath, () => {})
				}, 1000)
			}
		}
	)
}

function handleArtColor(message: any) {
	let { id, type, artPath, contrastRatio, appDataPath } = message

	let tempFolder = pathJoin(appDataPath, '/temp')

	let tempFilePath = `${tempFolder}/${id}.jpg`

	if (!fs.existsSync(tempFolder)) {
		fs.mkdirSync(tempFolder, { recursive: true })
	}

	spawn(`"${ffmpegPath}" -i "${artPath}" "${tempFilePath}"`, [], { shell: true }).on('close', code => {
		if (code === 1) {
			parentPort?.postMessage({
				type,
				contrastRatio,
				workerCallId: message.workerCallId,
				fileBuffer: Buffer.from(fs.readFileSync(tempFilePath))
			})
			setTimeout(() => {
				fs.unlink(tempFilePath, () => {})
			}, 1000)
		}
	})
}
