import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import stringHash from 'string-hash'
import trash from 'trash'
import { generateId } from '../functions/generateId.fn'
import { renameObjectKey } from '../functions/renameObjectKey.fn'
import { getWorker } from '../services/worker.service'
import { EditTag } from '../types/editTag.type'
import { FlacTagType } from '../types/flacTagType'
import { SongType } from '../types/song.type'
import { StreamSongType } from '../types/streamTag.type'
import { TagType } from '../types/tag.type'
import { TagModType } from '../types/tagMod.type'

let ffmpegPath = path.join(process.cwd(), '/electron-app/binaries/ffmpeg')

const mm = require('music-metadata')

/********************** Write Flac Tags **********************/
let ffmpegDeferredPromise: any = undefined
let ffmpegDeferredPromiseId: string

const ffmpegWorker = getWorker('ffmpeg')?.on('message', async (response: any) => {
	if (response.id === ffmpegDeferredPromiseId) {
		await trash(response.filePath)
		fs.renameSync(response.tempFileName, response.filePath)
		ffmpegDeferredPromise(response.status)
	}
})

export function writeFlacTags(filePath: string, newTags: any) {
	return new Promise((resolve, reject) => {
		ffmpegDeferredPromise = resolve
		ffmpegDeferredPromiseId = generateId()

		let ffmpegString = objectToFfmpegString(newTags)
		let tempFileName = filePath.replace(/(\.flac)$/, '.temp.flac')

		let command = `"${ffmpegPath}" -i "${filePath}"  -map 0 -y -codec copy ${ffmpegString} "${tempFileName}"`

		ffmpegWorker?.postMessage({ id: ffmpegDeferredPromiseId, filePath, tempFileName, command })
	})
}

/* export function writeFlacTags(filePath: string, newTags: any) {
	return new Promise((resolve, reject) => {

		resolve('')

		// let ffmpegMetatagString = objectToFfmpegString(newTags)
		// let templFileName = filePath.replace(/(\.flac)$/, '.temp.flac')

		// exec(
		// 	`"${ffmpegPath}" -i "${filePath}"  -map 0 -y -codec copy ${ffmpegMetatagString} "${templFileName}" && mv "${templFileName}" "${filePath}"`,
		// 	(error, stdout, stderr) => {}
		// ).on('close', () => {
		// 	resolve('Done')
		// })
	})
} */

/********************** Get Flac Tags **********************/
let worker = getWorker('musicMetadata')

let deferredPromise: Map<string, any> = new Map<string, any>()

worker?.on('message', (data) => {
	if (deferredPromise.has(data.filePath)) {
		deferredPromise.get(data.filePath)(data.metadata)
		deferredPromise.delete(data.filePath)
	}
})

export async function getFlacTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		const METADATA: any = await new Promise((resolve, reject) => {
			deferredPromise.set(filePath, resolve)
			worker?.postMessage(filePath)
		})

		let tags: SongType = {
			ID: stringHash(filePath),
			Extension: 'flac',
			SourceFile: filePath
		}

		const STATS = fs.statSync(filePath)
		let nativeTags: FlacTagType = mergeNatives(METADATA.native)

		let dateParsed = getDate(String(nativeTags.DATE))

		tags.Album = nativeTags?.ALBUM || ''
		tags.AlbumArtist = nativeTags?.ALBUMARTIST || ''
		tags.Artist = nativeTags?.ARTIST || ''
		tags.Comment = nativeTags?.DESCRIPTION || nativeTags?.COMMENT || ''
		tags.Composer = nativeTags?.COMPOSER || ''
		tags.Date_Year = dateParsed.year || 0
		tags.Date_Month = dateParsed.month || 0
		tags.Date_Day = dateParsed.day || 0
		tags.DiscNumber = Number(nativeTags?.DISCNUMBER) || 0
		tags.Genre = nativeTags?.GENRE || ''
		tags.Rating = Number(nativeTags?.RATING) || 0
		tags.Title = nativeTags?.TITLE || ''
		tags.Track = Number(nativeTags?.TRACKNUMBER) || 0

		tags.BitDepth = METADATA.format.bitsPerSample
		tags.BitRate = METADATA.format.bitrate / 1000
		tags.Duration = Math.trunc(METADATA.format.duration)
		tags.LastModified = STATS.mtimeMs
		tags.SampleRate = METADATA.format.sampleRate
		tags.Size = STATS.size

		resolve(tags)
	})
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
		// For : Separator
	} else if (dateString.includes(':')) {
		splitDate = dateString.split(':')
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

function objectToFfmpegString(newTags: EditTag) {
	let finalString = ''

	if (newTags.DiscNumber) renameObjectKey(newTags, 'DiscNumber', 'disc')
	if (newTags.AlbumArtist) renameObjectKey(newTags, 'AlbumArtist', 'Album_Artist')

	if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
		newTags.Date = `${newTags.Date_Year || '0000'}/${newTags.Date_Month || '00'}/${newTags.Date_Day || '00'}`

		delete newTags.Date_Year
		delete newTags.Date_Month
		delete newTags.Date_Day
	}

	for (let key in newTags) {
		finalString += ` -metadata "${key}=${newTags[key]}" `
	}

	return finalString
}
