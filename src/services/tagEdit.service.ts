import { writeAacTags } from '../formats/aac.format'
import { writeFlacTags } from '../formats/flac.format'
import { writeMp3Tags } from '../formats/mp3.format'
import { writeOpusTags } from '../formats/opus.format'
import { getWorker } from './worker.service'

// const worker = getWorker('tagEdit')
let songToEditQueue: { sourceFile: string; newTags: object }[] = []
let maxQueueLength = 0
let isQueueRunning = false

export function tagEdit(songList: string[], newTags: object) {
	songList.forEach((sourceFile) => songToEditQueue.push({ sourceFile, newTags }))

	if (maxQueueLength < songToEditQueue.length) {
		maxQueueLength = songToEditQueue.length
	}

	if (isQueueRunning === false) {
		isQueueRunning = true
		processQueue()
	}
}

async function processQueue() {
	let task = songToEditQueue.shift()

	// If no more tasks then stop processing queue.
	if (task === undefined) return (isQueueRunning = false)

	let extension = task.sourceFile.split('.').pop()
	let result

	//IMPORTANT Do something if error
	switch (extension) {
		case 'm4a':
			result = await writeAacTags(task.sourceFile, task.newTags)
			break
		case 'flac':
			result = await writeFlacTags(task.sourceFile, task.newTags)
			break
		case 'opus':
			result = await writeOpusTags(task.sourceFile, task.newTags)
			break
		case 'mp3':
			result = await writeMp3Tags(task.sourceFile, task.newTags)
			break
		default:
			break
	}

	console.log(result)

	processQueue()
}

export function getTagEditProgress() {
	return {
		maxLength: maxQueueLength,
		currentLength: songToEditQueue.length
	}
}
