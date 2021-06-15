import { FSWatcher, watch } from 'chokidar'
// import { createData, deleteData, getCollection } from './loki.service.bak'

import { Worker } from 'worker_threads'
import { getWorker, killWorker } from './worker.service'
import { OptionsType } from '../types/options.type'

import stringHash from 'string-hash'
import { appDataPath } from '..'
import { getStorageMapToArray } from './storage.service'

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

export function getRootDirFolderWatcher() {
	return watcher
}

export let taskQueue: any[] = []

let songsFound: string[] = []

export let maxTaskQueueLength: number = 0

// let workerSongData = getWorker('')

let storageWorker = getWorker('storage')

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

	watcher.on('add', (path) => {
		// For every file found, check if is a available audio format and add to list.
		if (isAudioFile(path)) {
			// Uses unshift instead of push to add to the beginning of the array since chokidar brings folders in reverse order.
			songsFound.push(path)
		}
	})

	watcher.on('change', (path) => {
		// TODO Storage fn
		// console.log('Changed: ',path)
	})

	watcher.on('unlink', (path) => {
		// TODO Storage fn
	})

	// watcher.on('all', (event, path) => {
	// 	console.log(event, path)
	// })

	watcher.on('ready', () => {
		// When watcher is done getting files, any new files added afterwards are detected here.
		watcher.on('add', (path) => addToTaskQueue(path, 'add'))

		filterNewSongs().then(() => {
			addNewSongs()
		})

		// startWorkers()

		console.log('ready')
	})
}

let opusFormatWorker = getWorker('opusFormat')

/*
	Adds new found songs.
		1. Get song tags
		2. Save to storage
*/
function addNewSongs() {

	console.log()

}

function startWorkers() {
	/* 	workerSongData.forEach((worker, index) => {
		setTimeout(() => {
			// console.log(index, 10000 * index)

			worker.on('message', (options: OptionsType) => {
				if (options.task === 'Not Tasks Left') {
					setTimeout(() => {
						processQueue(worker)
					}, 2000)
				} else if (options.task === 'Get Song Data') {
					storageWorker.postMessage({
						type: 'Add',
						data: options.data,
						appDataPath: appDataPath()
					})
					processQueue(worker)
				}
			})

			processQueue(worker)
		}, 5000 * index)
	}) */
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
			//TODO
			// deleteData({ ID: stringHash(path) }).then(() => processQueue(worker))
		}
	} else {
		worker.postMessage({
			task: 'Not Tasks Left'
		})
	}
}

function filterNewSongs() {
	return new Promise((resolve, reject) => {
		let worker = getWorker('songFilter') as Worker
		let collection = getStorageMapToArray().map((song) => song.SourceFile)

		worker.on('message', (data: string[]) => {
			data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'add')))
			killWorker('songFilter')
			resolve(null)
		})

		worker.postMessage({
			dbSongs: collection,
			foundSongs: songsFound
		})
	})
}

function addToTaskQueue(path: string, type: string) {
	taskQueue.push({
		type,
		path
	})
}

function isAudioFile(path: string) {
	return EXTENSIONS.includes(path.split('.').pop() || '')
}
