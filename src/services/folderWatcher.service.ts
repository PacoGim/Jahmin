import { FSWatcher, watch } from 'chokidar'
import { createData, getCollection } from './loki.service'

import { Worker } from 'worker_threads'

import { getAacTags } from '../formats/aac.format'
import { getFlacTags } from '../formats/flac.format'
import { getMp3Tags } from '../formats/mp3.format'
import { SongType } from '../types/song.type'

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3']

export function getRootDirFolderWatcher() {
	return watcher
}

export let taskQueue: any[] = []

let filesFound: string[] = []

export let maxTaskQueueLength: number = 0

let watchTaskQueueInterval: NodeJS.Timeout

const worker = new Worker('./electron-app/workers/folderScan.worker.js')

worker.on('message', (songData) => {
	createData(songData).then(() => processTaskQueue())
})

function processTaskQueue() {
	let task = taskQueue.shift()

	// console.log(maxTaskQueueLength, taskQueue.length, (100 / maxTaskQueueLength) * taskQueue.length)

	if (task) {
		clearInterval(watchTaskQueueInterval)
		if (taskQueue.length > maxTaskQueueLength) {
			maxTaskQueueLength = taskQueue.length
		}

		let { type, path } = task

		if (type === 'add') {
			worker.postMessage(path)
		}
	} else {
		clearInterval(watchTaskQueueInterval)

		watchTaskQueueInterval = setInterval(() => processTaskQueue(), 2000)
	}
}

export function getMaxTaskQueueLength() {
	return maxTaskQueueLength
}

export function getTaskQueueLength() {
	return taskQueue.length
}

// function getSongTags(path: string): Promise<SongType> {
// 	return new Promise((resolve, reject) => {
// 		let extension = path.split('.').pop() || undefined

// 		if (extension === 'm4a') {
// 			getAacTags(path).then((data) => resolve(data))
// 		} else if (extension === 'flac') {
// 			getFlacTags(path).then((data) => resolve(data))
// 		} else if (extension === 'mp3') {
// 			getMp3Tags(path).then((data) => resolve(data))
// 		}
// 	})
// }

export function watchFolders(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true
	})

	watcher.on('add', (path) => preAppStartFileDetection(path))

	watcher.on('ready', () => {
		watcher.on('add', (path) => addToTaskQueue(path, 'add'))

		checkNewSongs()

		watchTaskQueueInterval = setInterval(() => processTaskQueue(), 2000)
		console.log('ready')
	})
}

function checkNewSongs() {
	let collection = getCollection().map((song) => song.SourceFile)

	filterOutOldSongs(collection)
}

function filterOutOldSongs(collection: any[]) {
	let file = filesFound.shift()

	if (file) {
		if (collection.indexOf(file) === -1) {
			addToTaskQueue(file, 'add')
		}

		process.nextTick(() => filterOutOldSongs(collection))
		// setTimeout(() => {

		// }, 1)
	}
}

function addToTaskQueue(path: string, type: string) {
	taskQueue.push({
		type,
		path
	})
}

function preAppStartFileDetection(path: string) {
	if (isAudioFile(path)) {
		filesFound.unshift(path)
	}
}

function isAudioFile(path: string) {
	return EXTENSIONS.includes(path.split('.').pop() || '')
}
