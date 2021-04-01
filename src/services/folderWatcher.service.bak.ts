import chokidar, { watch } from 'chokidar'
import { parseFile } from 'music-metadata'
import fs from 'fs'
import { getGenre } from '../functions/getGenre.fn'
import { getComment } from '../functions/getComment.fn'
import { getComposer } from '../functions/getComposer.fn'
import { getRating } from '../functions/getRating.fn'
import { hash } from '../functions/hashString.fn'
import stringHash from 'string-hash'
import { createData, deleteData, getCollection, readData } from './loki.service'
import { SongType } from '../types/song.type'
import { getAlbumName } from '../functions/getAlbumName.fn'
import { getTitle } from '../functions/getTitle.fn'
import { observeArray } from '../functions/observeArray.fn'
import { getAlbumArtist } from '../functions/getAlbumArtist.fn'
import { getTrackNumber } from '../functions/getTrackNumber.fs'

import { getAacTags } from '../formats/aac.format'
import { getFlacTags } from '../formats/flac.format'
import { getMp3Tags } from '../formats/mp3.format'

const allowedExtensions = ['flac', 'm4a', 'mp3']

let watcher: chokidar.FSWatcher

export function getRootDirFolderWatcher() {
	return watcher
}

// Array to contain to next song to process, controls excessive I/O
let processQueue: { event: string; path: string }[] = []
let isQueueRunning = false

let totalChangesToProcess: number = 0
let totalProcessedChanged: number = 0

export function getTotalChangesToProcess() {
	return totalChangesToProcess
}

export function getTotalProcessedChanged() {
	return totalProcessedChanged
}

observeArray(processQueue, ['push'], () => {
	totalChangesToProcess++

	if (!isQueueRunning) {
		isQueueRunning = true
		applyFolderChanges()
	}
})

async function applyFolderChanges() {
	let changeToApply = processQueue.shift()

	if (changeToApply !== undefined) {
		let { event, path } = changeToApply

		if (['update', 'add'].includes(event)) {
			let fileToUpdate = await processedFilePath(path)

			if (fileToUpdate !== undefined) {
				await createData(fileToUpdate)
			}
		} else if (['delete'].includes(event)) {
			await deleteData({ SourceFile: path })
		}

		totalProcessedChanged++

		setImmediate(() => applyFolderChanges())
	} else {
		isQueueRunning = false
	}
}

// Potential issue if a user adds a big folder to scan and then another folder.
// Need to call to function but somehow cancel

export function watchFolders(rootDirectories: string[]) {
	let foundFiles: string[] = []

	watcher = chokidar.watch(rootDirectories, {
		awaitWriteFinish: true
	})

	watcher
		.on('change', (path) => {
			let ext = path.split('.').pop()?.toLowerCase()

			if (ext && allowedExtensions.includes(ext)) {
				processQueue.push({
					event: 'update',
					path
				})
			}
		})
		.on('unlink', (path) => {
			let ext = path.split('.').pop()?.toLowerCase()

			if (ext && allowedExtensions.includes(ext)) {
				processQueue.push({
					event: 'delete',
					path
				})
			}
		})
		.on('add', (path) => {
			let ext = path.split('.').pop()?.toLowerCase()

			if (ext && allowedExtensions.includes(ext)) {
				foundFiles.unshift(path)
			}
		})
		.on('ready', () => {
			processFiles(foundFiles)

			// Detects newly added files when app has started.
			watcher.on('add', (path) => {
				let ext = path.split('.').pop()?.toLowerCase()

				if (ext && allowedExtensions.includes(ext)) {
					processQueue.push({
						event: 'add',
						path
					})
				}
			})
		})
}

async function processFiles(files: string[]) {
	// Gets first element of array.
	let file = files.shift()

	// If no more files to process, then proceed to delete dead files.
	if (file === undefined) {
		console.log('Removing Dead Files')
		removeDeadFiles()
		return
	}



	processQueue.push({
		event: 'add',
		path: file
	})

	// Gets song metadata if song doesn't exist or was modified.
	// let fileToUpdate = await processedFilePath(file)

	// if (fileToUpdate !== undefined) {
	// 	await createData(fileToUpdate)
	// }

	setTimeout(() => {
		process.nextTick(() => processFiles(files))
	}, 1)
}

function processedFilePath(filePath: string): Promise<SongType | undefined> {
	return new Promise(async (resolve, reject) => {
		const id = stringHash(filePath)
		const extension = filePath.split('.').pop() || ''
		const fileStats = fs.statSync(filePath)

		let isFileModified = false

		let dbDoc = readData({ ID: id })

		if (dbDoc) {
			if (fileStats.mtimeMs !== dbDoc['LastModified']) {
				isFileModified = true
			}
		}

		if (dbDoc === undefined || isFileModified === true) {
			if (extension === 'm4a') {
				resolve(await getAacTags(filePath))
			}
			if (extension === 'flac') {
				resolve(await getFlacTags(filePath))
			}
			if (extension === 'mp3') {
				resolve(await getMp3Tags(filePath))
			}
			// resolve(await getFileMetatag(filePath, id, extension, fileStats))
		} else {
			resolve(undefined)
		}
	})
}

function removeDeadFiles() {
	let collection = getCollection()

	collection.forEach((song) => {
		if (!fs.existsSync(song['SourceFile'])) {
			console.log('Delete:', song['SourceFile'])
			deleteData({ SourceFile: song['SourceFile'] })
		}
	})
}
