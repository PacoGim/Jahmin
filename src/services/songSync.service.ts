import { FSWatcher, watch } from 'chokidar'
import { cpus } from 'os'
// import { createData, deleteData, getCollection } from './loki.service.bak'

import { Worker } from 'worker_threads'
import { getWorker, killWorker } from './worker.service'
import { OptionsType } from '../types/options.type'

import stringHash from 'string-hash'
import { appDataPath } from '..'
import { getStorageMapToArray } from './storage.service'
import { getOpusTags } from '../formats/opus.format'

const TOTAL_CPUS = cpus().length

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

export function getRootDirFolderWatcher() {
	return watcher
}

// export let taskQueue: any[] = []

let isQueueRunning = false

let workerExec = getWorker('nodeExec')

let taskQueue = new Proxy([] as any[], {
	get(target, fn: 'push' | 'unshift' | 'length') {
		if (fn === 'length' && target.length !== 0 && isQueueRunning === false) {
			isQueueRunning = true
			setTimeout(() => {
				processQueue()
			}, 1000)
		}
		return target[fn]
	}
})

// Splits excecution based on the amount of cpus.
function processQueue() {
	// Creates an array with the length from cpus amount and map it to true.
	let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true)

	// For each process, get a task.
	processesRunning.forEach((process, index) => getTask(index))

	// Shifts a taks from array and gets the tags.
	function getTask(cpuNumber: number) {
		let task = taskQueue.shift()

		if (task) {
			getTags(task).then((tags) => {
				//TODO Storage
				getTask(cpuNumber)
			})
		} else {
			// If no task left then sets its own process as false.
			processesRunning[cpuNumber] = false

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
		} else {
			resolve('')
		}
	})
}

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

		filterNewSongs() /*.then(() => {
			addNewSongs()
		})*/

		// startWorkers()

		console.log('ready')
	})
}

let nodeExecWorker = getWorker('nodeExec')

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
