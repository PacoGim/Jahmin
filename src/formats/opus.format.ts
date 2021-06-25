import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import stringHash from 'string-hash'
import { getWorker } from '../services/worker.service'
import { EditTag } from '../types/editTag.type'
import { OpusTagType } from '../types/opus.type'
import { SongType } from '../types/song.type'
let ffmpegPath = path.join(process.cwd(), '/electron-app/binaries/ffmpeg')

const mm = require('music-metadata')

const ffmpegWorker = getWorker('ffmpeg')

export function writeOpusTags(filePath: string, newTags: any) {
	return new Promise((resolve, reject) => {
		let ffmpegMetatagString = objectToFfmpegString(newTags)
		let templFileName = filePath.replace(/(\.opus)$/, '.temp.opus')

		if (ffmpegWorker) {
			ffmpegWorker.postMessage('TEST')
		}

		// console.log(ffmpegMetatagString,templFileName)

		// ffmpegWorker.postMessage('Test')

		/*
		console.log(3,new Date().toTimeString())
		console.time()

		exec(
			// `"${ffmpegPath}" -i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegMetatagString} "${templFileName}" && mv "${templFileName}" "${filePath}"`,
			`ls`,
			(error, stdout, stderr) => {
				console.log('error: ',error)
				console.log('stdout: ',stdout)
				console.log('stderr: ',stderr)
			}
		).on('close', () => {
			console.log(4,new Date().toTimeString())
			resolve('Done')
		})*/
	})
}

let worker = getWorker('musicMetadata')

let deferredPromise: Map<string, any> = new Map<string, any>()

worker?.on('message', (data) => {
	deferredPromise.get(data.filePath)(data.metadata)
	deferredPromise.delete(data.filePath)
})

export async function getOpusTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		const METADATA: any = await new Promise((resolve, reject) => {
			deferredPromise.set(filePath, resolve)
			worker?.postMessage(filePath)
		})

		let tags: SongType = {
			ID: stringHash(filePath),
			Extension: 'opus',
			SourceFile: filePath
		}

		const STATS = fs.statSync(filePath)
		let nativeTags: OpusTagType = mergeNatives(METADATA.native)

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
			finalObject[native[key][value]['id']] = native[key][value]['value']
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

	// if (newTags.DiscNumber) renameObjectKey(newTags, 'DiscNumber', 'disc')
	// if (newTags.AlbumArtist) renameObjectKey(newTags, 'AlbumArtist', 'Album_Artist')

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
