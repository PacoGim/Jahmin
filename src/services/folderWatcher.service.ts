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
import { TagType } from '../types/tag.type'
import { timeEnd } from 'console'
import { getAlbumName } from '../functions/getAlbumName.fn'
import { getTitle } from '../functions/getTitle.fn'

const allowedExtenstions = ['flac', 'm4a', 'mp3']

let watcher: chokidar.FSWatcher

export function getWatcher() {
	return watcher
}

export function watchFolders(rootDirectories: string[]) {
	let foundFiles: string[] = []

	watcher = chokidar.watch(rootDirectories, {
		ignoreInitial: false
	})

	watcher
		.on('change', (path) => {
			loopFiles([path])
		})
		.on('unlink', (path) => {
			deleteData({ SourceFile: path })
		})
		.on('add', (path) => {
			let ext = path.split('.').slice(-1)[0].toLowerCase()

			if (allowedExtenstions.includes(ext)) {
				foundFiles.push(path)
			}
		})
		.on('ready', () => {
			loopFiles(foundFiles)

			watcher.on('add', (path) => {
				loopFiles([path])
			})
		})
}

async function loopFiles(files: string[]) {
	let file = files.shift()

	if (file === undefined) {
		removeDeadFiles()
		return
	}

	const id = stringHash(file)
	const extension = file.split('.').pop() || ''
	const fileStats = fs.statSync(file)

	let isFileModified = false

	let dbDoc = readData({ ID: id })

	if (dbDoc) {
		if (fileStats.mtimeMs !== dbDoc['LastModified']) {
			isFileModified = true
		}
	}

	if (dbDoc === undefined || isFileModified === true) {
    let tags = await getFileMetatag(file, id, extension, fileStats)
		createData(tags)
	}

	setTimeout(() => {
		process.nextTick(() => loopFiles(files))
	}, 1)
}

function removeDeadFiles() {
	let collection = getCollection()

	collection.forEach((song, index) => {
		if (!fs.existsSync(song['SourceFile'])) {
			console.log('Delete:', song['SourceFile'])
			deleteData({ SourceFile: song['SourceFile'] })
		}
	})
}

function getFileMetatag(filePath: string, id: number, extension: string, fileStats: fs.Stats): Promise<TagType> {
	return new Promise((resolve, reject) => {
		parseFile(filePath).then((metadata) => {
			let doc: any = {
				SourceFile: filePath,
				ID: id,
				Extension: extension,
				Size: fileStats.size,
				Duration: metadata['format']['duration'] || 0,
				Title: getTitle(metadata,extension),
				Artist: metadata['common']['artist'] || undefined,
				Album: getAlbumName(metadata,extension),
				Genre: getGenre(metadata, extension),
				Comment: getComment(metadata, extension),
				Composer: getComposer(metadata),
				SampleRate: metadata['format']['sampleRate'] || undefined,
				LastModified: fileStats.mtimeMs || undefined,
				Year: metadata['common']['year'] || undefined,
				Date: metadata['common']['date'] || undefined,
				Track: metadata['common']['track']['no'] || undefined,
				AlbumArtist: metadata['common']['albumartist'] || undefined,
				DiskNumber: metadata['common']['disk']['no'] || undefined,
				BitRate: metadata['format']['bitrate'] || undefined,
				BitDepth: metadata['format']['bitsPerSample'] || undefined,
				Rating: getRating(metadata, extension)
			}

			for (let i in doc) {
				if (doc[i] === undefined) {
					delete doc[i]
				}
			}

			resolve(doc)
		})
	})
}
