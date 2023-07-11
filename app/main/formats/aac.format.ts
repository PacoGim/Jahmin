import * as fs from 'fs'
const stringHash = require('string-hash')
import { renameObjectKey } from '../functions/renameObjectKey.fn'
import truncToDecimalPointFn from '../functions/truncToDecimalPoint.fn'
import { getWorker, useWorker } from '../services/workers.service'
import { EditTag } from '../../types/editTag.type'
import { SongType } from '../../types/song.type'

import { Worker } from 'worker_threads'
import getDirectoryFn from '../functions/getDirectory.fn'

/********************** Write Aac Tags **********************/
let exifToolWriteWorker: Worker

getWorker('exifToolWrite').then(worker => (exifToolWriteWorker = worker))

export function writeAacTags(filePath: string, newTags: any): Promise<any> {
	return new Promise(async (resolve, reject) => {
		newTags = normalizeNewTags(newTags)

		useWorker({ filePath, newTags }, exifToolWriteWorker).then(response => {
			resolve(response)
		})
	})
}

/********************** Read Aac Tags **********************/
let exifToolReadWorker: Worker

getWorker('exifToolRead').then(worker => (exifToolReadWorker = worker))

export function getAacTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filePath)) {
			return reject('File not found')
		}

		useWorker({ filePath }, exifToolReadWorker).then(response => {
			const metadata = response.results.metadata

			const STATS = fs.statSync(filePath)

			let dateParsed = getDate(
				String(metadata.ContentCreateDate?.rawValue || metadata.ContentCreateDate || metadata.CreateDate)
			)

			if (!isNaN(metadata.Rating)) metadata.RatingPercent = metadata.Rating

			resolve({
				ID: stringHash(filePath),
				Directory: getDirectoryFn(filePath),
				Extension: metadata.FileTypeExtension,
				SourceFile: filePath,
				Album: metadata.Album || null,
				AlbumArtist: metadata.AlbumArtist || null,
				Artist: metadata.Artist || null,
				Comment: metadata.Comment || null,
				Composer: metadata.Composer || null,
				Date_Year: dateParsed.year || null,
				Date_Month: dateParsed.month || null,
				DiscNumber: metadata.DiskNumber || null,
				Date_Day: dateParsed.day || null,
				Genre: metadata.Genre || null,
				Rating: metadata.RatingPercent || metadata.Rating || null,
				Title: metadata.Title || null,
				//@ts-expect-error
				Track: getTrack(metadata.TrackNumber, metadata.Track) || null,
				BitDepth: metadata.AudioBitsPerSample || null,
				BitRate: getBitRate(metadata.AvgBitrate) || null,
				Duration: truncToDecimalPointFn(metadata.Duration, 3) || null,
				LastModified: STATS.mtimeMs,
				SampleRate: metadata.AudioSampleRate || null,
				Size: STATS.size,
				PlayCount: 0
			})
		})
	})
}

function normalizeNewTags(newTags: EditTag) {
	if (newTags.DiscNumber !== undefined) renameObjectKey(newTags, 'DiscNumber', 'DiskNumber')
	if (newTags.Track !== undefined) renameObjectKey(newTags, 'Track', 'TrackNumber')
	// if (newTags.Rating !== undefined) renameObjectKey(newTags, 'Rating', 'RatingPercent')

	if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
		newTags.AllDates = `${newTags.Date_Year || '0000'} ${newTags.Date_Month || '00'} ${newTags.Date_Day || '00'}`

		if (newTags.Date_Year && newTags.Date_Month) {
			newTags.ContentCreateDate = new Date(
				`${newTags.Date_Year}:${Number(newTags.Date_Month) + 1}:${newTags.Date_Day || 1}`
			).toUTCString()
		}

		delete newTags.Date_Year
		delete newTags.Date_Month
		delete newTags.Date_Day
	}

	return newTags
}

function getBitRate(bitRate: string | undefined) {
	if (bitRate) {
		return Number(bitRate.replace(/\D/g, ''))
	} else {
		return undefined
	}
}

function getDate(dateString: string) {
	let splitDate: any = []

	if (!dateString) {
		return {
			year: undefined,
			month: undefined,
			day: undefined
		}
	}

	if (dateString.includes('T')) {
		dateString = dateString.split('T')[0]
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

function getTrack(...trackValues: [string | number]) {
	let numberedTrackFound = trackValues.find(i => typeof i === 'number')

	if (numberedTrackFound) {
		return numberedTrackFound
	}

	for (let value of trackValues) {
		if (typeof value === 'string') {
			let splitTrack = Number(value.split(' ')[0])

			if (!isNaN(splitTrack)) {
				return splitTrack
			}
		}
	}
}
