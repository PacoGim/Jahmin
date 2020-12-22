// import { TagType } from '../types/tag.type'

import fs from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'
import { createData, readData } from './loki.service'
// import { customAlphabet } from 'nanoid'
// const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

export const validFormats = ['.flac', '.m4a', '.mp3', '.wav', '.ogg', '.opus']

//@ts-expect-error
let filesCollection: [string] = []

// Variable thats keeps the actual folder scan depth.
//@ts-expect-error
let depth: [string] = []

// Variable that keeps the recursivity amount to reactively know when the recursivity is done.
let recursivityControl = 0

let totalFiles = 0
let timer = 0
let counter = 0

// Main function
export function scanFolders(rootFolders: string[]) {
	console.log(`Scanning Folders ${recursivityControl}`)
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
			scanFolders(rootFolders)

			// Recursivity control when previous recursive call done.
			recursivityControl--

			// Removes first item of depth control array.
			depth.pop()
		} else {
			// If the item is not a folder, then, it only processes the item with the available formats set above.
			if (validFormats.includes(getExtension(item))) filesCollection.push(fileAbsolutePath)
		}
	})

	// If the recursivity control hits 0, then, we are done with the current root folder or all folders.
	if (recursivityControl === 0) {
		// Removes current folder from rootFolders array.
		rootFolders.shift()

		// If more root folders are available, the recursion call restarts. If not, it is done scanning folders.
		if (rootFolders.length > 0) {
			scanFolders(rootFolders)
		} else {
			console.log('Done ', filesCollection.length)
			// console.log(mm)
			totalFiles = filesCollection.length

			setInterval(() => {
				timer++

				let time = parseTime((totalFiles / counter) * timer)

				console.log(
					Number((100 / totalFiles) * (counter + 1)).toFixed(2),
					`% ${counter + 1} out of ${totalFiles} Done `,
					`ETA: ${time} at ${Math.round(counter / timer)} files/s`
				)
			}, 1000)
			getFilesMetaTag(filesCollection)
		}
	}
}

async function getFilesMetaTag(files: string[]) {
	if (files.length === 0) return console.log('Done')

	let filePath = files.shift()

	if (!filePath) return console.log('Done')

	const extension = filePath.split('.').pop() || ''
	const fileStats = fs.statSync(filePath)

	let doc = readData({ SourceFile: filePath })
	let isDiffTime = false

	if (doc) {
		isDiffTime = fs.statSync(filePath).mtimeMs !== doc['LastModified']
	}

	// console.time(filePath)
	if (doc === null || isDiffTime === true) {
		await parseAndSaveFile(filePath, extension, fileStats)
	}

	// console.timeEnd(filePath)

	counter++

	process.nextTick(() => getFilesMetaTag(files))
}

function parseAndSaveFile(filePath: string, extension: string, fileStats: fs.Stats): Promise<void> {
	return new Promise((resolve, reject) => {
		parseFile(filePath)
			.then((metadata) => {
				let doc: any = {
					SourceFile: filePath,
					Extension: extension,
					Size: fileStats.size,
					Duration: metadata['format']['duration'] || 0,
					Title: metadata['common']['title'] || undefined,
					Artist: metadata['common']['artist'] || undefined,
					Album: metadata['common']['album'] || undefined,
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

				setTimeout(() => createData(doc), 0)
			})
			.catch((err) => {
				console.error('Parse File', err.message)
			})
			.finally(() => resolve())
	})
}

function getComposer(doc: any) {
	let composer = doc['common']['composer']
	if (typeof composer === 'object') composer = composer[0]
	return composer
}

function getGenre(doc: any, extension: string) {
	if (extension === 'm4a') {
		let genre

		genre = doc['native']['iTunes'].find((i: any) => i['id'] === '©gen')

		if (genre === undefined || genre?.['value'] === '') {
			genre = doc['native']['iTunes'].find((i: any) => i['id'] === 'gnre')
		}

		if (genre) return genre['value']
	}

	let genre = doc['common']['genre']
	if (typeof genre === 'object') genre = genre[0]
	return genre
}

function getComment(doc: any, extension: string) {
	if (['ogg', 'opus', 'flac'].includes(extension)) {
		let comment = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'description')
		if (comment) return comment['value']

		comment = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'comment')
		if (comment) return comment['value']
		else return ''
	} else if (extension === 'mp3') {
		let comment = doc['native']['ID3v2.4'].find((i: any) => i['id'].toLowerCase() === 'txxx:comment')
		if (comment) return comment['value']

		comment = doc['common']['comment']
		if (typeof comment === 'object') comment = comment[0]
		if (comment) return comment
		else return ''
	} else {
		let comment = doc['common']['comment']
		if (typeof comment === 'object') comment = comment[0]
		return comment
	}
}

function getRating(doc: any, extension: string) {
	if (extension === 'm4a') {
		let rating = doc['native']['iTunes'].find((i: any) => i['id'].toLowerCase() === 'rate')
		if (rating) return Number(rating['value'])
		else return ''
	} else if (extension === 'ogg' || extension === 'opus') {
		let rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'ratingpercent')

		if (rating) return Number(rating['value'])

		rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'rating')

		if (rating) return getStars(rating['value'], 100)
		else return ''
	} else if (extension === 'mp3') {
		let rating = doc['native']['ID3v2.4'].find((i: any) => i['id'].toLowerCase() === 'txxx:ratingpercent')
		if (rating) return Number(rating['value'])

		rating = doc['native']['ID3v2.4'].find((i: any) => i['id'].toLowerCase() === 'popm')
		if (rating) return getStars(rating['value']['rating'], 255)
	} else if (extension === 'flac') {
		let rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'rating')
		if (rating) return Number(rating['value'])
		else return ''
	} else {
		return 'Not Defined'
	}
}

function getStars(value: number, maxValue: number) {
	return Number((100 / maxValue) * value)
}

// function getFilesMetaTag(collectionName:string,files: [string]) {
// 	console.log('Get Files MetaTag',files)
// 	let timer = 0
// 	let counter = 0

// 	setInterval(() => {
// 		timer++
// 	}, 1000)

// 	files.forEach(async (filePath, index) => {
// 		let file = undefined
// 		let isDiffTime = false

// 		try {
// 			file = readData(collectionName,filePath)
// 		} catch (error) {}

// 		if (file) {
// 			isDiffTime = fs.statSync(filePath).mtimeMs !== file['LastModified']
// 		}

// 		if (file === undefined || isDiffTime === true) {
// 			exiftool
// 				.read(filePath)
// 				.then(async (tags: TagType) => {
// 					let fileTags: TagType = {
// 						ID: nanoid(),
// 						SourceFile: tags['SourceFile'] || '',
// 						FileType: tags['FileType'] || '',
// 						FileSize: tags['FileSize'] || '',
// 						Duration: tags['Duration'] || 0,
// 						Title: tags['Title'] || '',
// 						Artist: tags['Artist'] || '',
// 						Album: tags['Album'] || '',
// 						Genre: tags['Genre'] || '',
// 						Comment: tags['Comment'] || '',
// 						Composer: tags['Composer'] || '',
// 						SampleRate: tags['SampleRate'] || '',
// 						LastModified: fs.statSync(tags['SourceFile']).mtimeMs,
// 						Knot:''
// 					}

// 					if (tags['FileType'] === 'MP3') {
// 						Object.assign(fileTags, {
// 							Track: tags['Track'],
// 							AlbumArtist: tags['Band'],
// 							Date: tags['DateTimeOriginal'],
// 							DiskNumber: tags['PartOfSet'],
// 							BitRate: tags['AudioBitrate']
// 						})
// 					} else if (tags['FileType'] === 'M4A') {
// 						Object.assign(fileTags, {
// 							Track: tags['TrackNumber'],
// 							AlbumArtist: tags['AlbumArtist'],
// 							Date: tags['ContentCreateDate'],
// 							DiskNumber: tags['DiskNumber'],
// 							BitRate: tags['AvgBitrate'],
// 							SampleRate: tags['AudioSampleRate'],
// 							BitDepth: tags['AudioBitsPerSample']
// 						})
// 					} else if (tags['FileType'] === 'FLAC') {
// 						Object.assign(fileTags, {
// 							Track: tags['TrackNumber'],
// 							AlbumArtist: tags['Albumartist'],
// 							Date: tags['Date'],
// 							DiskNumber: tags['Discnumber'],
// 							BitDepth: tags['BitsPerSample']
// 						})
// 					} else if (tags['FileType'] === 'OGG' || tags['FileType'] === 'OPUS') {
// 						Object.assign(fileTags, {
// 							Track: tags['TrackNumber'],
// 							AlbumArtist: tags['Albumartist'],
// 							Date: tags['Date'],
// 							DiskNumber: tags['Discnumber']
// 						})
// 					} else if (tags['FileType'] === 'WAV') {
// 						Object.assign(fileTags, {
// 							BitDepth: tags['BitsPerSample']
// 						})
// 					}

// 					// Adds file metatag to db
// 					await addData(collectionName, fileTags)

// 					let time = parseTime((files.length / counter) * timer)

// 					console.log(Number((100 / files.length) * (counter + 1)).toFixed(2), `% ${counter + 1} out of ${files.length} Done `, `ETA: ${time} at ${Math.round(counter / timer)} files/s`)

// 					if (files.length === counter + 1) {
// 						console.log('Done')
// 						createFilesIndex(collectionName)
// 					}
// 					counter++
// 				})
// 				.catch((err: any) => console.log(filePath, err))
// 		}else{
// 			counter++
// 		}
// 	})
// }

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
