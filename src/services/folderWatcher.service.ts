import { FSWatcher, watch } from 'chokidar'
import { createData, deleteData, getCollection } from './loki.service'

import { Worker } from 'worker_threads'
import { getSongDataWorkers, getSongFilterWorker } from './worker.service'
import { OptionsType } from '../types/options.type'

import stringHash from 'string-hash'

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3']

export function getRootDirFolderWatcher() {
	return watcher
}

export let taskQueue: any[] = []

let filesFound: string[] = []

export let maxTaskQueueLength: number = 0

let workerSongData = getSongDataWorkers()

export function getMaxTaskQueueLength() {
	return maxTaskQueueLength
}

export function getTaskQueueLength() {
	return taskQueue.length
}

export function watchFolders(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true,
		ignored: '**/*.DS_Store'
	})

	watcher.on('add', (path) => preAppStartFileDetection(path))

	watcher.on('change', (path) => addToTaskQueue(path, 'add'))
	watcher.on('unlink', (path) => addToTaskQueue(path, 'delete'))

	watcher.on('ready', () => {
		watcher.on('add', (path) => addToTaskQueue(path, 'add'))

		checkNewSongs()

		startWorkers()

		console.log('ready')
	})
}

function startWorkers() {
	workerSongData.forEach((worker, index) => {
		setTimeout(() => {
			// console.log(index, 10000 * index)

			worker.on('message', (options: OptionsType) => {
				if (options.task === 'Not Tasks Left') {
					setTimeout(() => {
						processQueue(worker)
					}, 2000)
				} else if (options.task === 'Get Song Data') {
					createData(options.data).then(() => {
						processQueue(worker)
					})
				}
			})

			processQueue(worker)
		}, 10000 * index)
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

		if (type === 'delete') {
			// console.log(task, path)
			deleteData({ ID: stringHash(path) }).then(() => processQueue(worker))
		}
	} else {
		worker.postMessage({
			task: 'Not Tasks Left'
		})
	}
}

function checkNewSongs() {
	let collection = getCollection().map((song) => song.SourceFile)

	let worker = getSongFilterWorker()

	worker.on('message', (data: string[]) => {
		data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'add')))
	})

	worker.postMessage({
		dbSongs: collection,
		foundSongs: filesFound
	})
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
