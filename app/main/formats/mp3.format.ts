import * as fs from 'fs'

const stringHash = require('string-hash')
import { SongType } from '../../types/song.type'

import { Mp3TagType } from '../../types/mp3TagType'
import { EditTag } from '../../types/editTag.type'
import { renameObjectKey } from '../functions/renameObjectKey.fn'
import { getWorker } from '../services/workers.service'
import truncToDecimalPointFn from '../functions/truncToDecimalPoint.fn'

import { Worker } from 'worker_threads'
import getDirectoryFn from '../functions/getDirectory.fn'

/********************** Write Mp3 Tags **********************/
let tagWriteDeferredPromise: any = undefined

let nodeId3Worker: Worker
getWorker('nodeID3').then(worker => {
	nodeId3Worker = worker

	nodeId3Worker.on('message', (response: any) => {
		tagWriteDeferredPromise(response)
	})
})

export function writeMp3Tags(filePath: string, newTags: any): Promise<any> {
	return new Promise((resolve, reject) => {
		newTags = normalizeNewTags(newTags)

		tagWriteDeferredPromise = resolve

		nodeId3Worker?.postMessage({ filePath, newTags })
	})
}

/********************** Get Mp3 Tags **********************/
let deferredPromise: Map<string, any> = new Map<string, any>()

let mmWorker: Worker

getWorker('musicMetadata').then(worker => {
	mmWorker = worker

	mmWorker.on('message', data => {
		if (deferredPromise.has(data.filePath)) {
			deferredPromise.get(data.filePath)(data.metadata)
			deferredPromise.delete(data.filePath)
		}
	})
})

export async function getMp3Tags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filePath)) {
			return reject('File not found')
		}

		const METADATA: any = await new Promise((resolve, reject) => {
			deferredPromise.set(filePath, resolve)
			mmWorker?.postMessage(filePath)
		})

		let tags: SongType = {
			ID: stringHash(filePath),
			Extension: 'mp3',
			SourceFile: filePath,
			Directory:getDirectoryFn(filePath),
		}

		const STATS = fs.statSync(filePath)
		let nativeTags: Mp3TagType = mergeNatives(METADATA.native)

		let dateParsed = getDate(String(nativeTags.TDRC || nativeTags.TYER))

		tags.Album = nativeTags?.TALB || null
		tags.AlbumArtist = nativeTags?.TPE2 || null
		tags.Artist = nativeTags?.TPE1 || null
		tags.Comment = nativeTags?.COMM?.text || null
		tags.Composer = nativeTags?.TCOM || null
		tags.Date_Year = dateParsed.year || null
		tags.Date_Month = dateParsed.month || null
		tags.Date_Day = dateParsed.day || null
		tags.DiscNumber = Number(nativeTags?.TPOS) || null
		tags.Genre = nativeTags?.TCON || null
		tags.Rating = convertRating('Jahmin', nativeTags?.POPM?.rating) || null
		tags.Title = nativeTags?.TIT2 || null
		tags.Track = Number(nativeTags?.TRCK) || Number(nativeTags?.track) || null

		tags.BitRate = METADATA.format.bitrate / 1000 || null
		tags.Duration = truncToDecimalPointFn(METADATA.format.duration, 3) || null
		tags.LastModified = STATS.mtimeMs
		tags.SampleRate = METADATA.format.sampleRate || null
		tags.Size = STATS.size

		tags.PlayCount = 0

		resolve(tags)
	})
}

function normalizeNewTags(newTags: EditTag) {
	if (newTags.Title) renameObjectKey(newTags, 'Title', 'TIT2')
	if (newTags.Track) renameObjectKey(newTags, 'Track', 'TRCK')
	if (newTags.Album) renameObjectKey(newTags, 'Album', 'TALB')
	if (newTags.AlbumArtist) renameObjectKey(newTags, 'AlbumArtist', 'TPE2')
	if (newTags.Artist) renameObjectKey(newTags, 'Artist', 'TPE1')
	if (newTags.Composer) renameObjectKey(newTags, 'Composer', 'TCOM')
	if (newTags.DiscNumber) renameObjectKey(newTags, 'DiscNumber', 'TPOS')
	if (newTags.Genre) renameObjectKey(newTags, 'Genre', 'TCON')
	if (newTags.Comment) renameObjectKey(newTags, 'Comment', 'comment')

	if (newTags.comment) {
		newTags.comment = {
			language: 'eng',
			text: newTags.comment
		}
	}

	if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
		newTags.TDRC = `${newTags.Date_Year || '0000'}/${newTags.Date_Month || '00'}/${newTags.Date_Day || '00'}`

		delete newTags.Date_Year
		delete newTags.Date_Month
		delete newTags.Date_Day
	}

	if (newTags.Rating) {
		newTags.popularimeter = {
			email: 'foo@bar.baz',
			rating: convertRating('Mp3', newTags.Rating),
			counter: 0
		}

		// delete newTags.Rating
	}

	return newTags
}

/**
 * @param {('Mp3' | 'Jahmin')} to - Mp3: Converts from (0 - 100) to (0 - 255) to save rating tag in file from renderer
 * @param {('Mp3' | 'Jahmin')} to - Jahmin: Converts from (0 - 255) to (0 - 100) for the renderer
 * @param {number} rating
 * @returns {*}  number | undefined
 */
function convertRating(to: 'Mp3' | 'Jahmin', rating: number): number | undefined {
	if (!isNaN(rating)) {
		if (to === 'Mp3') {
			return Math.round((255 / 100) * rating) // Converts 100 Rating to 255
		}

		if (to === 'Jahmin') {
			return Math.round((100 / 255) * rating) // Converts 255 Rating to 100
		}
	} else {
		return undefined
	}
}

function mergeNatives(native: any) {
	let finalObject: any = {}

	for (let key in native) {
		for (let value in native[key]) {
			if (finalObject[native[key][value]['id']]) {
				finalObject[native[key][value]['id']] = finalObject[native[key][value]['id']] + '//' + native[key][value]['value']
			} else {
				finalObject[native[key][value]['id']] = native[key][value]['value']
			}
		}
	}

	return finalObject
}

// export function getMp3Tags(filePath: string): Promise<SongType> {
// 	return new Promise((resolve, reject) => {
// 		exec(`"${ffprobePath()}" -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
// 			if (stdout) {
// 				let tags: SongType = {
// 					Extension: 'mp3'
// 				}

// 				let data = JSON.parse(stdout)

// 				let streamAudioData: StreamSongType = data['streams'].find((stream: StreamSongType) => stream['codec_type'] === 'audio')

// 				tags['SourceFile'] = filePath
// 				tags['SampleRate'] = Number(streamAudioData['sample_rate'])

// 				data = data['format']

// 				tags['BitRate'] = Number(data['bit_rate'])
// 				tags['Duration'] = Number(data['duration'])
// 				tags['Size'] = Number(data['size'])

// 				let dataTags = lowerCaseObjectKeys(data['tags'])

// 				let dateParsed = getDate(dataTags['date'] || dataTags['tyer'])

// 				tags['Rating'] = Number(dataTags['rating'])
// 				tags['Title'] = dataTags['title']
// 				tags['Artist'] = dataTags['artist']
// 				tags['Album'] = dataTags['album']
// 				tags['Genre'] = dataTags['genre']
// 				tags['Comment'] = dataTags['comment']
// 				tags['AlbumArtist'] = dataTags['album_artist']
// 				tags['Composer'] = dataTags['composer']
// 				tags['DiscNumber'] = dataTags['disc'] !== undefined ? Number(dataTags['disc']) : undefined
// 				tags['Date_Year'] = dateParsed['year']
// 				tags['Date_Month'] = dateParsed['month']
// 				tags['Date_Day'] = dateParsed['day']
// 				tags['Track'] = Number(dataTags['track'])

// 				tags['LastModified'] = fs.statSync(filePath).mtimeMs

// 				tags['ID'] = stringHash(filePath)

// 				resolve(tags)
// 			}
// 		})
// 	})
// }

function getDate(dateString: string): DateType {
	let splitDate: any = []

	if (!dateString) {
		return {
			year: undefined,
			month: undefined,
			day: undefined
		}
	}

	// For - Separator
	if (dateString.includes('-')) {
		splitDate = dateString.split('-')
		// For / Separator
	} else if (dateString.includes('/')) {
		splitDate = dateString.split('/')
		// For *space* Separator
	} else if (dateString.includes(' ')) {
		splitDate = dateString.split(' ')
		// For . Separator
	} else if (dateString.includes('.')) {
		splitDate = dateString.split('.')
	}

	if (splitDate.length > 1) {
		return {
			year: Number(splitDate[0]),
			month: Number(splitDate[1]) || undefined,
			day: Number(splitDate[2]) || undefined
		}
	} else {
		return {
			year: Number(dateString),
			month: undefined,
			day: undefined
		}
	}
}

type DateType = {
	year: number | undefined
	month: number | undefined
	day: number | undefined
}
