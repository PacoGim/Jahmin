import { TagType } from '../types/tag.type'

import fs from 'fs'
import path from 'path'
import { addData, createFilesIndex, readData } from './knotdb'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

const ExifTool = require('exiftool-vendored').ExifTool
const exiftool = new ExifTool({ taskTimeoutMillis: 1000 })

const formats = ['.flac', '.m4a', '.mp3', '.wav', '.ogg', '.opus']

//@ts-expect-error
let filesCollection: [string] = []

// Variable thats keeps the actual folder scan depth.
//@ts-expect-error
let depth: [string] = []

// Variable that keeps the recursivity amount to reactively know when the recursivity is done.
let recursivityControl = 0

// Main function
export function scanFolders(collectionName:string,rootFolders: string[]) {
	if (rootFolders.length <= 0) return

	let folderPath = rootFolders[0]

	fs.readdirSync(folderPath + depth.join('/')).forEach((item: string) => {
		const fileAbsolutePath = getAbsolutePath(folderPath, item)

		// If item is a Directory and it is NOT a Hidden Folder it adds it to the Depth array to scan it on next recursive call.
		if (fs.lstatSync(fileAbsolutePath).isDirectory() && !isHiddenFolder(item)) {
			// Adds to the depth array the found directory.
			depth.push('/' + item)

			// Controls recursivity amount to detect when recursivity done.
			recursivityControl++

			// Recursive Call
			scanFolders(collectionName,rootFolders)

			// Recursivity control when previous recursive call done.
			recursivityControl--

			// Removes first item of depth control array.
			depth.pop()
		} else {
			// If the item is not a folder, then, it only processes the item with the available formats set above.
			if (formats.includes(getExtension(item))) filesCollection.push(fileAbsolutePath)
		}
	})

	// If the recursivity control hits 0, then, we are done with the current root folder or all folders.
	if (recursivityControl === 0) {
		// Removes current folder from rootFolders array.
		rootFolders.shift()

		// If more root folders are available, the recursion call restarts. If not, it is done scanning folders.
		if (rootFolders.length > 0) {
			scanFolders(collectionName,rootFolders)
		} else {
			console.log('Done ', filesCollection.length)
			getFilesMetaTag(collectionName,filesCollection)
		}
	}
}

function getFilesMetaTag(collectionName:string,files: [string]) {
	let timer = 0
	let counter = 0

	setInterval(() => {
		timer++
	}, 1000)

	files.forEach(async (filePath, index) => {
		let file = undefined
		let isDiffTime = false

		try {
			file = readData(collectionName,filePath)
		} catch (error) {}

		if (file) {
			isDiffTime = fs.statSync(filePath).mtimeMs !== file['LastModified']
		}

		if (file === undefined || isDiffTime === true) {
			exiftool
				.read(filePath)
				.then(async (tags: TagType) => {
					let fileTags: TagType = {
						ID: nanoid(),
						SourceFile: tags['SourceFile'] || '',
						FileType: tags['FileType'] || '',
						FileSize: tags['FileSize'] || '',
						Duration: tags['Duration'] || 0,
						Title: tags['Title'] || '',
						Artist: tags['Artist'] || '',
						Album: tags['Album'] || '',
						Genre: tags['Genre'] || '',
						Comment: tags['Comment'] || '',
						Composer: tags['Composer'] || '',
						SampleRate: tags['SampleRate'] || '',
						LastModified: fs.statSync(tags['SourceFile']).mtimeMs,
						Knot:''
					}

					if (tags['FileType'] === 'MP3') {
						Object.assign(fileTags, {
							Track: tags['Track'],
							AlbumArtist: tags['Band'],
							Date: tags['DateTimeOriginal'],
							DiskNumber: tags['PartOfSet'],
							BitRate: tags['AudioBitrate']
						})
					} else if (tags['FileType'] === 'M4A') {
						Object.assign(fileTags, {
							Track: tags['TrackNumber'],
							AlbumArtist: tags['AlbumArtist'],
							Date: tags['ContentCreateDate'],
							DiskNumber: tags['DiskNumber'],
							BitRate: tags['AvgBitrate'],
							SampleRate: tags['AudioSampleRate'],
							BitDepth: tags['AudioBitsPerSample']
						})
					} else if (tags['FileType'] === 'FLAC') {
						Object.assign(fileTags, {
							Track: tags['TrackNumber'],
							AlbumArtist: tags['Albumartist'],
							Date: tags['Date'],
							DiskNumber: tags['Discnumber'],
							BitDepth: tags['BitsPerSample']
						})
					} else if (tags['FileType'] === 'OGG' || tags['FileType'] === 'OPUS') {
						Object.assign(fileTags, {
							Track: tags['TrackNumber'],
							AlbumArtist: tags['Albumartist'],
							Date: tags['Date'],
							DiskNumber: tags['Discnumber']
						})
					} else if (tags['FileType'] === 'WAV') {
						Object.assign(fileTags, {
							BitDepth: tags['BitsPerSample']
						})
					}

					// Adds file metatag to db
					await addData(collectionName, fileTags)

					let time = parseTime((files.length / counter) * timer)

					console.log(Number((100 / files.length) * (counter + 1)).toFixed(2), `% ${counter + 1} out of ${files.length} Done `, `ETA: ${time} at ${Math.round(counter / timer)} files/s`)

					if (files.length === counter + 1) {
						console.log('Done')
						createFilesIndex(collectionName)
					}
					counter++
				})
				.catch((err: any) => console.log(filePath, err))
		}else{
			counter++
		}
	})
}

function parseTime(timeInSeconds: number) {
	if (timeInSeconds >= 3600) {
		return `${Math.ceil(timeInSeconds / 3600)}h ${Math.ceil(timeInSeconds % 3600)}m`
	} else {
		return `${Math.ceil(timeInSeconds / 60)}m ${Math.ceil(timeInSeconds % 60)}s`
	}
}

function getAbsolutePath(rootFolderPath: string, value: string): string {
	return path.join(rootFolderPath, depth.join('/'), value)
}

function isHiddenFolder(value: string): boolean {
	if (value.charAt(0) === '.') return true
	else return false
}

function getExtension(value: string): string {
	return path.extname(value).toLowerCase()
}
