import { cpus } from 'os'
import { Worker } from 'worker_threads'

/********************** Services **********************/
import { getWorker, useWorker } from './workers.service'
import { getConfig } from './config.service'
import { startChokidarWatch } from './chokidar.service'

/********************** Functions **********************/
import sendWebContentsFn from '../functions/sendWebContents.fn'
import sortByOrderFn from '../functions/sortByOrder.fn'
import getSongTagsFn from '../functions/getSongTags.fn'
import updateSongTagsFn from '../functions/updateSongTags.fn'
import hashFn from '../functions/hashString.fn'
import isExcludedPathsFn from '../functions/isExcludedPaths.fn'
import removeDuplicateObjectsFromArrayFn from '../functions/removeDuplicateObjectsFromArray.fn'
import getAllFilesInFoldersDeepFn from '../functions/getAllFilesInFoldersDeep.fn'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'

export let maxTaskQueueLength: number = 0

const TOTAL_CPUS = cpus().length

let isQueueRunning = false
let taskQueue: any[] = []

let timeToProcess: number | undefined = undefined
let lastProcessTime: number | undefined = undefined

let dbWorker: Worker

let songFilterWorker: Worker

getWorker('database').then(worker => (dbWorker = worker))
getWorker('songFilter').then(worker => (songFilterWorker = worker))

export async function fetchSongsTag() {
	const config = getConfig()

	if (config?.directories === undefined) {
		return
	}

	isQueueRunning = false
	taskQueue = []
	maxTaskQueueLength = 0

	let filesInFolders = getAllFilesInFoldersDeepFn(config.directories.add, allowedSongExtensionsVar)

	let audioFiles = filesInFolders
		.filter(path => isExcludedPathsFn(path, config.directories.exclude))
		.sort((a, b) => a.localeCompare(b))

	useWorker(
		{
			type: 'read',
			data: {
				queryData: {
					select: ['SourceFile']
				}
			}
		},
		dbWorker
	).then(response => {
		filterSongs(audioFiles, response.results.data)
	})

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

	taskQueue = sortByOrderFn(taskQueue, 'type', ['delete', 'update', 'external-update', 'insert'])

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
		lastProcessTime = Date.now()

		getSongTagsFn(task.path)
			.then(tags => {
				if (timeToProcess === undefined || Math.floor(Math.random() * (100 - 0 + 1) + 0) === 100) {
					timeToProcess = Date.now() - lastProcessTime!
				}

				dbWorker.postMessage({
					type: 'create',
					data: tags
				})
			})
			.catch()
			.finally(() => {
				getTask(processIndex, processesRunning)
			})
	} else if (task.type === 'update') {
		handleUpdateTask(task, processIndex, processesRunning)
	} else if (task.type === 'external-update') {
		handleExternalUpdateTask(task, processIndex, processesRunning)
	} else if (task.type === 'delete') {
		dbWorker.postMessage({
			type: 'delete',
			data: task.path
		})

		// console.log(task)
		// sendWebContentsFn('web-storage', {
		// 	type: 'delete',
		// 	data: hashFn(task.path, 'number')
		// })
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
		.then(response => {
			// Response can be 0 | 1 | -1
			// -1 means error.
			if (response === -1) {
				// sendWebContentsFn('web-storage', {
				// 	type: task.type,
				// 	data: undefined
				// })
			} else {
				// Removes Mp3 Popularimeter (Rating) tag.
				if (newTags?.popularimeter) {
					delete newTags.popularimeter
				}

				dbWorker.postMessage({
					type: 'update',
					data: {
						queryId: null,
						songId: hashFn(task.path, 'number'),
						newTags
					}
				})
			}
		})
		.catch()
		.finally(() => {
			// console.log('Done')
			// setTimeout(() => {
			// watchPaths([task.path])
			// }, 10000)
			getTask(processIndex, processesRunning)
		})
}

async function handleExternalUpdateTask(task: any, processIndex: number, processesRunning: boolean[]) {
	let newTags: any = undefined

	newTags = await getSongTagsFn(task.path).catch()

	// console.log(task, processIndex)

	// console.log(newTags)
	dbWorker.postMessage({
		type: 'update',
		data: {
			queryId: null,
			songId: hashFn(task.path, 'number'),
			newTags
		}
	})

	// sendWebContentsFn('web-storage', {
	// 	type: task.type,
	// 	data: {
	// 		id: hashFn(task.path, 'number'),
	// 		newTags
	// 	}
	// })

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

	sendWebContentsFn('song-sync-queue-progress', {
		isSongUpdating: taskQueue.find(task => task.type === 'update') !== undefined,
		currentLength: taskQueue.length,
		maxLength: maxTaskQueueLength,
		timeToProcess
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

async function filterSongs(audioFilesFound: string[] = [], dbSongs: { SourceFile: string }[]) {
	// Use a worker to filter songs to add to the database
	useWorker({ type: 'add', data: { userSongs: audioFilesFound, dbSongs } }, songFilterWorker).then(response => {
		// For each song returned by the worker, add it to the task queue for insertion
		response.results.songs.forEach((songPath: string) => {
			process.nextTick(() => addToTaskQueue(songPath, 'insert'))
		})

		// Use a worker to filter songs to delete from the database
		useWorker({ type: 'delete', data: { userSongs: audioFilesFound, dbSongs } }, songFilterWorker).then(response => {
			// For each song returned by the worker, add it to the task queue for deletion
			response.results.songs.forEach((songPath: string) => {
				process.nextTick(() => addToTaskQueue(songPath, 'delete'))
			})
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
					sendWebContentsFn('web-storage', {
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
