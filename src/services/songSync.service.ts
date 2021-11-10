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

const TOTAL_CPUS = cpus().length

let watcher: FSWatcher

const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus']

let storageWorker = getWorker('storage')

let isQueueRunning = false
let taskQueue: any[] = []
let audioFolders: string[] = []

export let maxTaskQueueLength: number = 0

export async function watchFolders(rootDirectories: string[]) {
	let audioFolders = getAllAudioFolders(rootDirectories)

	let audioFiles = getAllAudioFilesInFolders(audioFolders).sort((a, b) => a.localeCompare(b))

	filterSongs(audioFiles)

	startChokidarWatch(rootDirectories)
}

export function startChokidarWatch(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true
	})

	watcher.on('ready', () => {
		watcher.on('add', path => {
			console.log(path, 'added')
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'insert')
			}
		})

		watcher.on('change', (path: string) => {
			console.log(path, 'changed')
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'update')
			}
		})

		watcher.on('unlink', (path: string) => {
			console.log(path, 'unlink')
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
		let task = taskQueue.shift()

		// This part goes to Storage Worker TS
		if (task !== undefined && ['insert', 'update'].includes(task.type)) {
			getTags(task).then(tags => {
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
			if (processesRunning.every(process => process === false)) {
				isQueueRunning = false
			}
		}
	}
}

function getTags(task: any) {
	return new Promise((resolve, reject) => {
		let extension = task.path.split('.').pop().toLowerCase()

		if (extension === 'opus') {
			getOpusTags(task.path).then(tags => resolve(tags))
		} else if (extension === 'mp3') {
			getMp3Tags(task.path).then(tags => resolve(tags))
		} else if (extension === 'flac') {
			getFlacTags(task.path).then(tags => resolve(tags))
		} else if (extension === 'm4a') {
			getAacTags(task.path).then(tags => resolve(tags))
		} else {
			resolve('')
		}
	})
}

function filterSongs(audioFilesFound: string[] = []) {
	return new Promise((resolve, reject) => {
		let worker = getWorker('songFilter') as Worker
		let collection = getStorageMapToArray().map(song => song.SourceFile)

		worker.on('message', (data: { type: 'songsToAdd' | 'songsToDelete'; songs: string[] }) => {
			if (data.type === 'songsToAdd') {
				data.songs.forEach(song => process.nextTick(() => addToTaskQueue(song, 'insert')))
			}

			if (data.type === 'songsToDelete') {
				data.songs.forEach(song => process.nextTick(() => addToTaskQueue(song, 'delete')))
				killWorker('songFilter')
				resolve(null)
			}
		})

		worker.postMessage({
			dbSongs: collection,
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

	if (isQueueRunning === false) {
		isQueueRunning = true
		processQueue()
	}
}

function getAllAudioFilesInFolders(rootDirectories: string[]) {
	let allFiles: string[] = []

	rootDirectories.forEach(rootDirectory => {
		let files = fs.readdirSync(rootDirectory)

		files.forEach(file => {
			let filePath = path.join(rootDirectory, file)

			if (isAudioFile(file)) {
				allFiles.push(filePath)
			} else if (fs.statSync(filePath).isDirectory()) {
				allFiles = allFiles.concat(getAllAudioFilesInFolders([filePath]))
			}
		})
	})

	return allFiles
}

function getAllAudioFolders(rootDirectories: string[]) {
	let folders: string[] = []

	rootDirectories.forEach(rootDirectory => {
		let files = fs.readdirSync(rootDirectory)

		files.forEach(file => {
			let filePath = path.join(rootDirectory, file)

			if (fs.statSync(filePath).isDirectory()) {
				if (fs.readdirSync(filePath).find(file => isAudioFile(file))) {
					folders.push(filePath)
				}

				folders = folders.concat(getAllAudioFolders([filePath]))
			}
		})
	})

	return folders
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
			getTags({ path: dbSong.SourceFile }).then(tags => {
				storageWorker?.postMessage({
					type: 'update',
					data: tags,
					appDataPath: appDataPath()
				})
			})
		}
	})
}
