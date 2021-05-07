import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import stringHash from 'string-hash'
import { FlacTagType } from '../types/flacTagType'
import { SongType } from '../types/song.type'
import { StreamSongType } from '../types/streamTag.type'
import { TagType } from '../types/tag.type'
import { TagModType } from '../types/tagMod.type'

const mm = require('music-metadata')

export function writeFlacTags(filePath: string, newTags: TagModType) {
	return new Promise((resolve, reject) => {
		let ffmpegMetatagString = objectToFfmpegString(newTags)

		exec(
			`../binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec copy -write_id3v2 1 ${ffmpegMetatagString} "./out/${filePath
				.split('/')
				.pop()}"`,
			(error, stdout, stderr) => {
				// if (error) {
				// 	console.log(error)
				// }
				// if (stdout) {
				// 	console.log(stdout)
				// }
				// if (stderr) {
				// 	console.log(stderr)
				// 	resolve(undefined)
				// }
			}
		).on('close', () => {
			resolve('Done')
		})
	})
}

export async function getFlacTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		let tags: SongType = {
			Extension: 'flac'
		}

		const STATS = fs.statSync(filePath)
		const METADATA = await mm.parseFile(filePath)
		let nativeTags: FlacTagType = mergeNatives(METADATA.native)

		let dateParsed = getDate(String(nativeTags.DATE))

		tags.ID = stringHash(filePath)

		tags.LastModified = STATS.mtimeMs
		tags.Size = STATS.size
		tags.SourceFile = filePath
		tags.SampleRate = METADATA.format.sampleRate
		tags.BitRate = METADATA.format.bitrate / 1000
		tags.Duration = Math.trunc(METADATA.format.duration)

		tags.Album = nativeTags?.ALBUM || ''
		tags.Artist = nativeTags?.ARTIST || ''
		tags.AlbumArtist = nativeTags?.ALBUMARTIST || ''
		tags.Comment = nativeTags?.DESCRIPTION || nativeTags?.COMMENT || ''
		tags.Composer = nativeTags?.COMPOSER || ''
		tags.Date_Year = dateParsed.year || null
		tags.Date_Month = dateParsed.month || null
		tags.Date_Day = dateParsed.day || null
		tags.DiscNumber = Number(nativeTags?.DISCNUMBER) || null
		tags.Track = Number(nativeTags?.TRACKNUMBER) || null
		tags.Title = nativeTags?.TITLE || ''
		tags.Genre = nativeTags?.GENRE || ''
		tags.Rating = Number(nativeTags?.RATING) || 0

		// console.log(tags)

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

function objectToFfmpegString(tags: TagModType) {
	let finalString = ''

	for (let key in tags) {
		finalString += ` -metadata "${key}=${tags[key]}" `
	}

	return finalString
}

function lowerCaseObjectKeys(objectToProcess: any) {
	let newObject: any = {}

	for (let key in objectToProcess) {
		newObject[key.toLowerCase()] = objectToProcess[key]
	}

	return newObject
}
