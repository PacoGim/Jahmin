import { FSWatcher, watch } from 'chokidar'
import { cpus } from 'os'
import fs from 'fs'
import path from 'path'

import { Worker } from 'worker_threads'
import { getWorker, killWorker } from './worker.service'

import { appDataPath } from '..'
import { getStorageMap, getStorageMapToArray } from './storage.service'
import { getOpusTags } from '../formats/opus.format'
import { getMp3Tags } from '../formats/mp3.format'
import { getFlacTags } from '../formats/flac.format'
import { getAacTags } from '../formats/aac.format'
import { SongType } from '../types/song.type'
import { ConfigType } from '../types/config.type'
import { sendWebContents } from './sendWebContents.service'
import { getConfig } from './config.service'

const TOTAL_CPUS = cpus().length

let watcher: FSWatcher | undefined

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

let storageWorker = getWorker('storage')

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

// Splits excecution based on the amount of cpus.
function processQueue() {
	// Creates an array with the length from cpus amount and map it to true.
	let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true)

	// For each process, get a task.
	processesRunning.forEach((process, processIndex) => getTask(processIndex))

	// Shifts a task from array and gets the tags.
	function getTask(processIndex: number) {
		let task = taskQueue.shift()

		// This part works with Storage Worker TS
		if (task !== undefined && ['insert', 'update'].includes(task.type)) {
			getTags(task)
				.then(tags => {
					sendWebContents('web-storage', {
						type: task.type,
						data: tags
					})

					getTask(processIndex)
				})
				.catch(err => {
					getTask(processIndex)
				})
		} else if (task !== undefined && ['delete'].includes(task.type)) {
			sendWebContents('web-storage', {
				type: task.type,
				data: task.path
			})
			getTask(processIndex)
		} else {
			// If no task left then sets its own process as false.
			processesRunning[processIndex] = false

			// And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
			if (processesRunning.every(process => process === false)) {
				isQueueRunning = false
			}
		}
	}
}

function getTags(task: any): Promise<SongType | null> {
	return new Promise((resolve, reject) => {
		let extension = task.path.split('.').pop().toLowerCase()

		if (extension === 'opus') {
			getOpusTags(task.path)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'mp3') {
			getMp3Tags(task.path)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'flac') {
			getFlacTags(task.path)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'm4a') {
			getAacTags(task.path)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else {
			resolve(null)
		}
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
				console.log('songsToDelete', data.songs)
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

function addToTaskQueue(path: string, type: 'insert' | 'delete' | 'update' | 'deleteFolder') {
	if (type === 'delete') {
		taskQueue.unshift({
			path: path,
			type: type
		})
	} else {
		taskQueue.push({
			type,
			path
		})
	}

	if (taskQueue.length > maxTaskQueueLength) {
		maxTaskQueueLength = taskQueue.length
	}

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
		currentLength: taskQueue.length,
		maxLength: maxTaskQueueLength
	})

	if (!(taskQueue.length === 0 && maxTaskQueueLength === 0)) {
		setTimeout(() => {
			sendSongSyncQueueProgress()
		}, 1000)
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
			getTags({ path: dbSong.SourceFile })
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
