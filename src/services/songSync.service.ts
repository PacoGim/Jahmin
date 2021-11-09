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
import fileExistsWithCaseSync from '../functions/fileExistsWithCaseSync.fn'

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

export function watchFoldersTemp(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true,
		ignored: ['**/*.DS_Store']
	})

	console.time('watchFolders')

	watcher.on('addDir', (path: string) => {
		fs.readdir(path, (err, files) => {
			if (err) {
				return
			} else {
				if (files.find(file => isAudioFile(file))) {
					audioFolders.push(path)
				}
			}
		})
	})

	watcher.on('add', (path: string) => {
		// console.log(path)
	})

	/*

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

	watcher.on('all', (event, path) => {
		console.log(event, path)
	})


	watcher.on('ready', () => {
		// When watcher is done getting files, any new files added afterwards are detected here.
		watcher.on('add', (path) => {
			if (isAudioFile(path)) {
				addToTaskQueue(path, 'insert')
			}
		})

		filterNewSongs()
	})
	*/
}

function filterSongs(audioFilesFound: string[] = []) {
	return new Promise((resolve, reject) => {
		let worker = getWorker('songFilter') as Worker
		let collection = getStorageMapToArray().map(song => song.SourceFile)

		worker.on('message', (data: { songsToAdd: string[]; songsToDelete: string[] }) => {
			data.songsToDelete.forEach(song => process.nextTick(() => addToTaskQueue(song, 'delete')))
			data.songsToAdd.forEach(song => process.nextTick(() => addToTaskQueue(song, 'insert')))

			killWorker('songFilter')
			resolve(null)
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

/********************** On Lookout **********************/
export function reloadAlbumData(albumId: string) {
	//IMPORTANT Fix issue when deleting songs? Or when updating
	// Trashed Some Songs -> Renumbered -> Renamed = Song list only had 2 songs
	let album = getStorageMap().get(albumId)
	let rootDir = album?.RootDir

	if (rootDir === undefined) return

	if (fileExistsWithCaseSync(rootDir) === false) {
		storageWorker?.postMessage({
			type: 'deleteFolder',
			data: rootDir,
			appDataPath: appDataPath()
		})

		return
	}

	// Gets all song in folder.
	let rootDirSongs = fs
		.readdirSync(rootDir)
		.filter(file => isAudioFile(file))
		.map(file => path.join(rootDir || '', file))

	// Filters all song present in DB but NOT in folder in another array.
	let songToRemove = album?.Songs.filter(song => !rootDirSongs?.includes(song.SourceFile))

	if (songToRemove && songToRemove?.length > 0) {
		songToRemove.forEach(song => {
			storageWorker?.postMessage({
				type: 'delete',
				data: song.SourceFile,
				appDataPath: appDataPath()
			})
		})
	}

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
