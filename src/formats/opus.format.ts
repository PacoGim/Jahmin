import fs from 'fs'
import path from 'path'
import stringHash from 'string-hash'
import generateId from '../functions/generateId.fn'
import { getWorker } from '../services/worker.service'
import { EditTag } from '../types/editTag.type'
import { OpusTagType } from '../types/opus.type'
import { SongType } from '../types/song.type'

let ffmpegPath = path.join(process.cwd(), '/electron-app/binaries/ffmpeg')

/********************** Write Opus Tags **********************/
let ffmpegDeferredPromise: any = undefined
let ffmpegDeferredPromiseId: string

const ffmpegWorker = getWorker('ffmpeg')?.on('message', async (response: any) => {
	if (response.id === ffmpegDeferredPromiseId) {
		if (fs.existsSync(response.tempFileName)) {
			fs.unlinkSync(response.filePath)
			fs.renameSync(response.tempFileName, response.filePath)
		}
		ffmpegDeferredPromise(response.status)
	}
})

export function writeOpusTags(filePath: string, newTags: any): Promise<any> {
	return new Promise((resolve, reject) => {
		ffmpegDeferredPromise = resolve
		ffmpegDeferredPromiseId = generateId()

		let ffmpegString = objectToFfmpegString(newTags)
		let tempFileName = filePath.replace(/(\.opus)$/, '.temp.opus')

		let command = `"${ffmpegPath}" -i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegString} "${tempFileName}"`

		ffmpegWorker?.postMessage({ id: ffmpegDeferredPromiseId, filePath, tempFileName, command })
	})
}

/********************** Get Opus Tags **********************/
let mmWorker = getWorker('musicMetadata')

let mmDeferredPromises: Map<string, any> = new Map<string, any>()

mmWorker?.on('message', data => {
	if (mmDeferredPromises.has(data.filePath)) {
		mmDeferredPromises.get(data.filePath)(data.metadata)
		mmDeferredPromises.delete(data.filePath)
	}
})

export async function getOpusTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filePath)) {
			return reject('File not found')
		}

		const METADATA: any = await new Promise((resolve, reject) => {
			mmDeferredPromises.set(filePath, resolve)
			mmWorker?.postMessage(filePath)
		})

		let tags: SongType = {
			ID: stringHash(filePath),
			Extension: 'opus',
			SourceFile: filePath
		}

		fs.stat(filePath, (err, stats) => {
			if (err) {
				return reject(err)
			}

			if (stats) {
				let nativeTags: OpusTagType = mergeNatives(METADATA.native)

				let dateParsed = getDate(String(nativeTags.DATE))

				tags.Album = nativeTags?.ALBUM || null
				tags.AlbumArtist = nativeTags?.ALBUMARTIST || null
				tags.Artist = nativeTags?.ARTIST || null
				tags.Comment = nativeTags?.DESCRIPTION || nativeTags?.COMMENT || null
				tags.Composer = nativeTags?.COMPOSER || null
				tags.Date_Year = dateParsed.year || null
				tags.Date_Month = dateParsed.month || null
				tags.Date_Day = dateParsed.day || null
				tags.DiscNumber = Number(nativeTags?.DISCNUMBER) || null
				tags.Genre = nativeTags?.GENRE || null
				tags.Rating = Number(nativeTags?.RATING) || null
				tags.Title = nativeTags?.TITLE || null
				tags.Track = Number(nativeTags?.TRACKNUMBER) || null

				tags.BitRate = METADATA.format.bitrate / 1000 || null
				tags.Duration = Math.trunc(METADATA.format.duration) || null
				tags.LastModified = stats.mtimeMs
				tags.SampleRate = METADATA.format.sampleRate || null
				tags.Size = stats.size

				resolve(tags)
			}
		})
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
