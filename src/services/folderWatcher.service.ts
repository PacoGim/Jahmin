import { FSWatcher, watch } from 'chokidar'
import { createData, getCollection } from './loki.service'

import { Worker } from 'worker_threads'
import { getWorkers } from './worker.service'
import { OptionsType } from '../types/options.type'

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3']

export function getRootDirFolderWatcher() {
	return watcher
}

export let taskQueue: any[] = []

let filesFound: string[] = []

export let maxTaskQueueLength: number = 0

let workerSongData = getWorkers().filter((worker) => worker.type === 'SongData')

export function getMaxTaskQueueLength() {
	return maxTaskQueueLength
}

export function getTaskQueueLength() {
	return taskQueue.length
}

export function watchFolders(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true
	})

	watcher.on('add', (path) => preAppStartFileDetection(path))

	watcher.on('ready', () => {
		watcher.on('add', (path) => addToTaskQueue(path, 'add'))

		checkNewSongs()

		startWorkers()

		console.log('ready')
	})
}

function startWorkers() {
	workerSongData.forEach((worker) => {
		worker.worker.on('message', (options: OptionsType) => {
			if (options.task === 'Not Tasks Left') {
				setTimeout(() => {
					processQueue(worker.worker)
				}, 2000)
			} else if (options.task === 'Get Song Data') {
				createData(options.data).then(() => processQueue(worker.worker))
			}
		})

		processQueue(worker.worker)
	})
}

function processQueue(worker: Worker) {
	let task = taskQueue.shift()

	if (task) {
		if (taskQueue.length > maxTaskQueueLength) {
			maxTaskQueueLength = taskQueue.length
		}

		let { type, path } = task

		if (type === 'add') {
			worker.postMessage({
				task: 'Get Song Data',
				data: {
					path
				}
			})
		}
	} else {
		worker.postMessage({
			task: 'Not Tasks Left'
		})
	}
}

function checkNewSongs() {
	let collection = getCollection().map((song) => song.SourceFile)

	filterOutOldSongs(collection)
}

function filterOutOldSongs(collection: any[]) {
	//TODO Add worker myah
	let file = filesFound.shift()

	if (file) {
		if (collection.indexOf(file) === -1) {
			addToTaskQueue(file, 'add')
		}

		process.nextTick(() => filterOutOldSongs(collection))
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
