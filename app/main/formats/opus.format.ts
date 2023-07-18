import * as fs from 'fs'
const stringHash = require('string-hash')

import generateId from '../functions/generateId.fn'
import truncToDecimalPointFn from '../functions/truncToDecimalPoint.fn'
import { getWorker, useWorker } from '../services/workers.service'
import { EditTag } from '../../types/editTag.type'
import { OpusTagType } from '../../types/opus.type'
import { SongType } from '../../types/song.type'

import { Worker } from 'worker_threads'
import getDirectoryFn from '../functions/getDirectory.fn'

/********************** Write Opus Tags **********************/
let ffmpegWorker: Worker

getWorker('ffmpeg').then(worker => (ffmpegWorker = worker))

export function writeOpusTags(filePath: string, newTags: any): Promise<any> {
	return new Promise((resolve, reject) => {
		let ffmpegString = objectToFfmpegString(newTags)
		let tempFileName = filePath.replace(/(\.opus)$/, '.temp.opus')

		let command = `-i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegString} "${tempFileName}"`

		useWorker({ filePath, tempFileName, command }, ffmpegWorker).then(response => {
			fs.access(response.results.tempFileName, err => {
				if (!err) {
					fs.unlink(response.results.filePath, () => {
						fs.rename(response.results.tempFileName, response.results.filePath, () => {
							resolve(response)
						})
					})
				}
			})
		})
	})
}

/********************** Get Opus Tags **********************/
let mmWorker: Worker

getWorker('musicMetadata').then(worker => (mmWorker = worker))

export async function getOpusTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filePath)) {
			return reject('File not found')
		}

		useWorker({ filePath }, mmWorker).then(response => {
			const metadata = response.results.metadata

			let tags: SongType = {
				ID: stringHash(filePath),
				Extension: 'opus',
				SourceFile: filePath,
				Directory: getDirectoryFn(filePath)
			}

			fs.stat(filePath, (err, stats) => {
				if (err) {
					return reject(err)
				}

				if (stats) {
					let nativeTags: OpusTagType = mergeNatives(metadata.native)

					let dateParsed = getDate(String(nativeTags.DATE))

					tags.Album = nativeTags?.ALBUM || null
					tags.AlbumArtist = nativeTags?.ALBUMARTIST || null
					tags.Artist = nativeTags?.ARTIST || null
					tags.Comment = nativeTags?.DESCRIPTION || nativeTags?.COMMENT || null
					tags.Composer = nativeTags?.COMPOSER || null
					tags.DateYear = dateParsed.year || null
					tags.DateMonth = dateParsed.month || null
					tags.DateDay = dateParsed.day || null
					tags.DiscNumber = Number(nativeTags?.DISCNUMBER) || null
					tags.Genre = nativeTags?.GENRE || null
					tags.Rating = Number(nativeTags?.RATING) || null
					tags.Title = nativeTags?.TITLE || null
					tags.Track = Number(nativeTags?.TRACKNUMBER) || null

					tags.BitRate = metadata.format.bitrate / 1000 || null
					tags.Duration = truncToDecimalPointFn(metadata.format.duration, 3) || null
					tags.LastModified = stats.mtimeMs
					tags.SampleRate = metadata.format.sampleRate || null
					tags.Size = stats.size

					tags.PlayCount = 0

					resolve(tags)
				}
			})
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

	if (newTags.DateYear || newTags.DateMonth || newTags.DateDay) {
		newTags.Date = `${newTags.DateYear || '0000'}/${newTags.DateMonth || '00'}/${newTags.DateDay || '00'}`

		delete newTags.DateYear
		delete newTags.DateMonth
		delete newTags.DateDay
	}

	for (let key in newTags) {
		finalString += ` -metadata "${key}=${newTags[key]}" `
	}

	return finalString
}
