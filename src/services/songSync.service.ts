import { FSWatcher, watch } from 'chokidar'
import { cpus } from 'os'
import fs from 'fs'
import path from 'path'

import { Worker } from 'worker_threads'
import { getWorker } from './worker.service'

import { getStorageMap } from './storage.service'
import { SongType } from '../types/song.type'

import { sendWebContents } from './sendWebContents.service'
import { getConfig } from './config.service'
import sortByOrderFn from '../functions/sortByOrder.fn'
import getSongTagsFn from '../functions/getSongTags.fn'
import getFileExtensionFn from '../functions/getFileExtension.fn'
import updateSongTagsFn from '../functions/updateSongTags.fn'
import { hash } from '../functions/hashString.fn'

const TOTAL_CPUS = cpus().length

let watcher: FSWatcher | undefined

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

let isQueueRunning = false
let taskQueue: any[] = []

export let maxTaskQueueLength: number = 0

let foundPaths: string[] = []

export async function watchFolders(dbSongs: SongType[]) {
	const config = getConfig()

	if (config?.directories === undefined) {
		return
	}

	isQueueRunning = false
	taskQueue = []
	maxTaskQueueLength = 0

	let filesInFolders = getAllFilesInFoldersDeep(config.directories.add)

	let audioFiles = filesInFolders
		.filter(path => isExcludedPaths(path, config.directories.exclude))
		.filter(file => isAudioFile(file))
		.sort((a, b) => a.localeCompare(b))

	filterSongs(audioFiles, dbSongs)
	// startChokidarWatch(directories.add, directories.exclude)
}

function isExcludedPaths(path: string, excludedPaths: string[]) {
	let isExcluded = false

	for (let excludedPath of excludedPaths) {
		if (path.includes(excludedPath)) {
			isExcluded = true
			break
		}
	}

	return !isExcluded
}

export function startChokidarWatch(rootDirectories: string[], excludeDirectories: string[] = []) {
	if (watcher) {
		watcher.close()
		watcher = undefined
	}

	watcher = watch(rootDirectories, {
		awaitWriteFinish: true,
		ignored: '**/*.DS_Store'
	})

	watcher.unwatch(excludeDirectories)

	watcher.on('add', (path: string) => {
		foundPaths.push(path)
	})

	watcher.on('ready', () => {
		watcher!.on('add', path => {
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'insert')
			}
		})

		watcher!.on('change', (path: string) => {
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'update')
			}
		})

		watcher!.on('unlink', (path: string) => {
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'delete')
			}
		})
	})
}

// Splits excecution based on the amount of cpus.
function processQueue() {
	// Creates an array with the length from cpus amount and map it to true.
	let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true)

	// For each process, get a task.
	processesRunning.forEach((process, processIndex) => getTask(processIndex))

	// Shifts a task from array and gets the tags.
	function getTask(processIndex: number) {
		taskQueue = removeDuplicateObjectsFromArray(taskQueue)

		taskQueue = sortByOrderFn(taskQueue, 'type', ['delete', 'update', 'insert'])

		if (taskQueue.length > maxTaskQueueLength) {
			maxTaskQueueLength = taskQueue.length
		}

		let task = taskQueue.shift()

		if (task === undefined) {
			// If no task left then sets its own process as false.
			processesRunning[processIndex] = false

			// And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
			if (processesRunning.every(process => process === false)) {
				isQueueRunning = false
			}
			return
		}

		if (task.type === 'insert') {
			getSongTagsFn(task.path)
				.then(tags => {
					sendWebContents('web-storage', {
						type: 'insert',
						data: tags
					})
				})
				.catch()
				.finally(() => getTask(processIndex))
		} else if (task.type === 'update') {
			let newTags: any = undefined

			if (task.data !== undefined) {
				newTags = task.data
			} else {
				getSongTagsFn(task.path)
					.then(tags => {
						newTags = tags
					})
					.catch()
			}

			updateSongTagsFn(task.path, newTags)
				.then(result => {
					// Result can be 0 | 1 | -1
					// -1 means error.
					if (result === -1) {
						sendWebContents('web-storage', {
							type: 'update',
							data: undefined
						})
					} else {
						sendWebContents('web-storage', {
							type: 'update',
							data: {
								id: hash(task.path, 'number'),
								newTags
							}
						})
					}
				})
				.catch()
				.finally(() => getTask(processIndex))
		} else if (task.type === 'delete') {
			sendWebContents('web-storage', {
				type: 'delete',
				data: task.path
			})
			getTask(processIndex)
		}
	}
}

export function addToTaskQueue(path: string, type: 'insert' | 'delete' | 'update', data: any = undefined) {
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

function removeDuplicateObjectsFromArray(array: any[]) {
	return [...new Map(array.map(v => [JSON.stringify(v), v])).values()]
}

export function sendSongSyncQueueProgress() {
	if (taskQueue.length === 0) {
		maxTaskQueueLength = 0
	}

	sendWebContents('song-sync-queue-progress', {
		currentLength: taskQueue.length,
		maxLength: maxTaskQueueLength
	})

	if (!(taskQueue.length === 0 && maxTaskQueueLength === 0)) {
		setTimeout(() => {
			sendSongSyncQueueProgress()
		}, 1000)
	}
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

export function unwatchPaths(paths: string[]) {
	if (watcher) {
		paths.forEach(path => watcher!.unwatch(path))
	}
}

export function watchPaths(paths: string[]) {
	if (watcher) {
		paths.forEach(path => watcher!.add(path))
	}
}

function getAllFilesInFoldersDeep(rootDirectory: string[]) {
	let allFiles: string[] = []

	rootDirectory.forEach(rootDirectory => {
		let files = fs.readdirSync(rootDirectory)

		files.forEach(file => {
			let filePath = path.join(rootDirectory, file)

			if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
				allFiles = allFiles.concat(getAllFilesInFoldersDeep([filePath]))
			} else {
				allFiles.push(filePath)
			}
		})
	})

	return allFiles
}

function isAudioFile(path: string) {
	return EXTENSIONS.includes(path.split('.').pop() || '')
}

export function getRootDirFolderWatcher() {
	return watcher
}

export function getMaxTaskQueueLength() {
	return maxTaskQueueLength
}

export function getTaskQueueLength() {
	return taskQueue.length
}

export function reloadAlbumData(albumId: string) {
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
}
