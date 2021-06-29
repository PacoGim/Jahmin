import { parentPort } from 'worker_threads'
import { writeAacTags } from '../formats/aac.format'
import { writeFlacTags } from '../formats/flac.format'
import { writeMp3Tags } from '../formats/mp3.format'
import { writeOpusTags } from '../formats/opus.format'

let songToEditQueue: { sourceFile: string; newTags: object }[] = []
let maxQueueLength = 0
let isQueueuIterating = false

parentPort?.on('message', (data: { message: string; parameter: any }) => {
	if (data.message === 'TagEdit') {
		handleTagEdit(data.parameter)
	}

	if (data.message === 'GetProgress') {
		parentPort?.postMessage({
			message: data.message,
			parameter: {
				currentLength: songToEditQueue.length,
				maxLength: maxQueueLength
			}
		})
	}
})

function handleTagEdit(tagsToEditAndSourceFile: any) {
	songToEditQueue.push(tagsToEditAndSourceFile)

	if (maxQueueLength < songToEditQueue.length) {
		maxQueueLength = songToEditQueue.length
	}

	if (!isQueueuIterating) {
		isQueueuIterating = true
		iterateQueue()
	}
}

function iterateQueue() {
	let file = songToEditQueue.shift()

	if (file) {
		console.time(file.sourceFile)
		let extension = file.sourceFile.split('.').pop()

		if (extension === 'm4a') {
			writeAacTags(file.sourceFile, file.newTags)
				.then(() => {
					iterateQueue()
				})
				.catch((err) => {
					//IMPORTANT Do something if err
					iterateQueue()
				})
		} else if (extension === 'opus') {
			writeOpusTags(file.sourceFile, file.newTags).then(() => {
				iterateQueue()
			})
		} else if (extension === 'flac') {
			writeFlacTags(file.sourceFile, file.newTags).then(() => {
				iterateQueue()
			})
		} else if (extension === 'mp3') {
			writeMp3Tags(file.sourceFile, file.newTags).then(() => {
				iterateQueue()
			})
		}
	} else {
		isQueueuIterating = false
		maxQueueLength = 0
	}
}
