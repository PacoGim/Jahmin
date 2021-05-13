import { parentPort } from 'worker_threads'
import { writeAacTags } from '../formats/aac.format'
import { writeFlacTags } from '../formats/flac.format'
import { writeMp3Tags } from '../formats/mp3.format'

let songToEditQueue: { sourceFile: string; newTags: object }[] = []
let isQueueuIterating = false

parentPort?.on('message', (tagsToEditAndSourceFile) => {
	songToEditQueue.push(tagsToEditAndSourceFile)

	if (!isQueueuIterating) {
		isQueueuIterating = true
		iterateQueue()
	}
})

function iterateQueue() {
	let file = songToEditQueue.shift()

	if (file) {
		let extension = file.sourceFile.split('.').pop()

		if (extension === 'm4a') {
			writeAacTags(file.sourceFile, file.newTags)
				.then(() => iterateQueue())
				.catch((err) => {
					//IMPORTANT Do something if err
					iterateQueue()
				})
		} else if (extension === 'flac') {
			writeFlacTags(file.sourceFile, file.newTags).then(() => iterateQueue())
		} else if (extension === 'mp3') {
			writeMp3Tags(file.sourceFile, file.newTags).then(() => iterateQueue())
		}
	} else {
		isQueueuIterating = false
	}
}
