import { FSWatcher, watch } from 'chokidar'
import { cpus } from 'os'

import { Worker } from 'worker_threads'
import { getWorker, killWorker } from './worker.service'

import { appDataPath } from '..'
import { getStorageMapToArray } from './storage.service'
import { getOpusTags } from '../formats/opus.format'
import { getMp3Tags } from '../formats/mp3.format'
import { getFlacTags } from '../formats/flac.format'
import { getAacTags } from '../formats/aac.format'

const TOTAL_CPUS = cpus().length

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

export function getRootDirFolderWatcher() {
	return watcher
}

// export let taskQueue: any[] = []

let isQueueRunning = false

let storageWorker = getWorker('storage')

let taskQueue: any[] = []

// Splits excecution based on the amount of cpus.
function processQueue() {
	// Creates an array with the length from cpus amount and map it to true.
	let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true)

	// For each process, get a task.
	processesRunning.forEach((process, processIndex) => getTask(processIndex))

	// Shifts a task from array and gets the tags.
	function getTask(processIndex: number) {
		let task = taskQueue.shift()

		// This part goes to Storage Worker TS
		if (task !== undefined && ['insert', 'update'].includes(task.type)) {
			getTags(task).then((tags) => {
				storageWorker?.postMessage({
					type: task.type,
					data: tags,
					appDataPath: appDataPath()
				})
				getTask(processIndex)
			})
		} else if (task !== undefined && ['delete'].includes(task.type)) {
			storageWorker?.postMessage({
				type: task.type,
				data: task.path,
				appDataPath: appDataPath()
			})
			getTask(processIndex)
		} else {
			// If no task left then sets its own process as false.
			processesRunning[processIndex] = false

			// And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
			if (processesRunning.every((process) => process === false)) {
				isQueueRunning = false
			}
		}
	}
}

function getTags(task: any) {
	return new Promise((resolve, reject) => {
		let extension = task.path.split('.').pop().toLowerCase()

		if (extension === 'opus') {
			getOpusTags(task.path).then((tags) => resolve(tags))
		} else if (extension === 'mp3') {
			getMp3Tags(task.path).then((tags) => resolve(tags))
		} else if (extension === 'flac') {
			getFlacTags(task.path).then((tags) => resolve(tags))
		} else if (extension === 'm4a') {
			getAacTags(task.path).then((tags) => resolve(tags))
		} else {
			resolve('')
		}
	})
}

let songsFound: string[] = []

export let maxTaskQueueLength: number = 0

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
			songsFound.push(path)
		}
	})

	watcher.on('change', (path) => {
		if (isAudioFile(path)) {
			addToTaskQueue(path, 'update')
		}
	})

	watcher.on('unlink', (path) => {
		if (isAudioFile(path)) {
			addToTaskQueue(path, 'delete')
		}
	})

	// watcher.on('all', (event, path) => {
	// 	console.log(event, path)
	// })

	watcher.on('ready', () => {
		// When watcher is done getting files, any new files added afterwards are detected here.
		watcher.on('add', (path) => addToTaskQueue(path, 'insert'))

		filterNewSongs()
	})
}

function filterNewSongs() {
	return new Promise((resolve, reject) => {
		let worker = getWorker('songFilter') as Worker
		let collection = getStorageMapToArray().map((song) => song.SourceFile)

		worker.on('message', (data: string[]) => {
			data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'insert')))
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

	if (isQueueRunning === false) {
		processQueue()
	}
}

function isAudioFile(path: string) {
	return EXTENSIONS.includes(path.split('.').pop() || '')
}
