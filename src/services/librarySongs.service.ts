import { cpus } from 'os'

import { Worker } from 'worker_threads'
import { getWorker } from './worker.service'

import { SongType } from '../types/song.type'

import { sendWebContents } from '../functions/sendWebContents.fn'
import { getConfig } from './config.service'
import sortByOrderFn from '../functions/sortByOrder.fn'
import getSongTagsFn from '../functions/getSongTags.fn'
import updateSongTagsFn from '../functions/updateSongTags.fn'
import { hash } from '../functions/hashString.fn'
import isExcludedPathsFn from '../functions/isExcludedPaths.fn'
import removeDuplicateObjectsFromArrayFn from '../functions/removeDuplicateObjectsFromArray.fn'
import getAllFilesInFoldersDeepFn from '../functions/getAllFilesInFoldersDeep.fn'
import isAudioFileFn from '../functions/isAudioFile.fn'
import { startChokidarWatch, watchPaths } from './chokidar.service'

const TOTAL_CPUS = cpus().length

let isQueueRunning = false
let taskQueue: any[] = []

export let maxTaskQueueLength: number = 0

export async function fetchSongsTag(dbSongs: SongType[]) {
	const config = getConfig()

	if (config?.directories === undefined) {
		return
	}

	isQueueRunning = false
	taskQueue = []
	maxTaskQueueLength = 0

	let filesInFolders = getAllFilesInFoldersDeepFn(config.directories.add)

	let audioFiles = filesInFolders
		.filter(path => isExcludedPathsFn(path, config.directories.exclude))
		.filter(file => isAudioFileFn(file))
		.sort((a, b) => a.localeCompare(b))

	filterSongs(audioFiles, dbSongs)
	startChokidarWatch(config.directories.add, config.directories.exclude)
}

// Splits excecution based on the amount of cpus.
function processQueue() {
	// Creates an array with the length from cpus amount and map it to true.
	let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true)

	// For each process, get a task.
	processesRunning.forEach((process, processIndex) => getTask(processIndex, processesRunning))
}
// Shifts a task from array and gets the tags.
function getTask(processIndex: number, processesRunning: boolean[]) {
	taskQueue = removeDuplicateObjectsFromArrayFn(taskQueue)

	taskQueue = sortByOrderFn(taskQueue, 'type', ['delete', 'update', 'insert', 'external-update'])

	if (taskQueue.length > maxTaskQueueLength) {
		maxTaskQueueLength = taskQueue.length
	}

	let task = taskQueue.shift()

	if (task === undefined) {
		// If no task left then sets its own process as false.
		processesRunning[processIndex] = false

		// And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
		if (processesRunning.every((process: any) => process === false)) {
			isQueueRunning = false
		}
		return
	}

	if (task.type === 'insert') {
		console.log(task)
		getSongTagsFn(task.path)
			.then(tags => {
				sendWebContents('web-storage', {
					type: 'insert',
					data: tags
				})
			})
			.catch()
			.finally(() => getTask(processIndex, processesRunning))
	} else if (task.type === 'update') {
		handleUpdateTask(task, processIndex, processesRunning)
	} else if (task.type === 'external-update') {
		handleExternalUpdateTask(task, processIndex, processesRunning)
	} else if (task.type === 'delete') {
		sendWebContents('web-storage', {
			type: 'delete',
			data: hash(task.path, 'number')
		})
		getTask(processIndex, processesRunning)
	}
}

async function handleUpdateTask(task: any, processIndex: number, processesRunning: boolean[]) {
	let newTags: any = undefined

	if (task.data !== undefined) {
		newTags = task.data
	} else {
		newTags = await getSongTagsFn(task.path).catch()
		console.log('newTags', newTags)
	}

	updateSongTagsFn(task.path, { ...newTags })
		.then(result => {
			// Result can be 0 | 1 | -1
			// -1 means error.
			if (result === -1) {
				sendWebContents('web-storage', {
					type: task.type,
					data: undefined
				})
			} else {
				// Removes Mp3 Popularimeter (Rating) tag.
				if (newTags?.popularimeter) {
					delete newTags.popularimeter
				}

				sendWebContents('web-storage', {
					type: task.type,
					data: {
						id: hash(task.path, 'number'),
						newTags
					}
				})
			}
		})
		.catch()
		.finally(() => {
			watchPaths([task.path])
			getTask(processIndex, processesRunning)
		})
}

async function handleExternalUpdateTask(task: any, processIndex: number, processesRunning: boolean[]) {
	let newTags: any = undefined

	newTags = await getSongTagsFn(task.path).catch()

	sendWebContents('web-storage', {
		type: task.type,
		data: {
			id: hash(task.path, 'number'),
			newTags
		}
	})

	getTask(processIndex, processesRunning)
}

export function addToTaskQueue(path: string, type: 'insert' | 'delete' | 'update' | 'external-update', data: any = undefined) {
	let newTask = {
		type,
		path,
		data
	}

	taskQueue.push(newTask)

	if (isQueueRunning === false) {
		isQueueRunning = true
		sendSongSyncQueueProgress()
		processQueue()
	}
}

export function sendSongSyncQueueProgress() {
	if (taskQueue.length === 0) {
		maxTaskQueueLength = 0
	}

	sendWebContents('song-sync-queue-progress', {
		isSongUpdating: taskQueue.find(task => task.type === 'update') !== undefined,
		currentLength: taskQueue.length,
		maxLength: maxTaskQueueLength
	})

	if (!(taskQueue.length === 0 && maxTaskQueueLength === 0)) {
		setTimeout(() => {
			sendSongSyncQueueProgress()
		}, 1000)
	}
}

export function stopSongsUpdating() {
	return new Promise(resolve => {
		taskQueue = taskQueue.filter(task => task.type !== 'update')

		resolve(null)
	})
}

function filterSongs(audioFilesFound: string[] = [], dbSongs: SongType[]) {
	return new Promise((resolve, reject) => {
		let worker = getWorker('songFilter') as Worker

		worker.on('message', (data: { type: 'songsToAdd' | 'songsToDelete'; songs: string[] }) => {
			if (data.type === 'songsToAdd') {
				data.songs.forEach(songPath => process.nextTick(() => addToTaskQueue(songPath, 'insert')))
			}

			if (data.type === 'songsToDelete') {
				if (data.songs.length > 0) {
					sendWebContents('web-storage-bulk-delete', data.songs)
				}
			}
		})

		worker.postMessage({
			dbSongs,
			userSongs: audioFilesFound
		})
	})
}

export function getMaxTaskQueueLength() {
	return maxTaskQueueLength
}

export function getTaskQueueLength() {
	return taskQueue.length
}

export function reloadAlbumData(albumId: string) {
	/*
	let album = getStorageMap().get(albumId)
	let rootDir = album?.RootDir

	if (rootDir === undefined) return

	// Gets all song in folder.
	let rootDirSongs = fs
		.readdirSync(rootDir)
		.filter(file => isAudioFile(file))
		.map(file => path.join(rootDir || '', file))

	// Check changes between local songs and DB song by comparing last modified time.
	rootDirSongs.forEach(songPath => {
		let dbSong = album?.Songs.find(song => song.SourceFile === songPath)

		// If song found in db and local song modified time is bigger than db song.
		if (dbSong && fs.statSync(dbSong?.SourceFile).mtimeMs > dbSong?.LastModified!) {
			getSongTagsFn(dbSong.SourceFile)
				.then(tags => {
					sendWebContents('web-storage', {
						type: 'update',
						data: tags
					})
				})
				.catch(err => {
					console.error(err)
				})
		}
	})
	*/
}
