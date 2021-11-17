// import { ExifTool } from 'exiftool-vendored'
// const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })
import fs from 'fs'
import stringHash from 'string-hash'
import { renameObjectKey } from '../functions/renameObjectKey.fn'
import { getWorker } from '../services/worker.service'
import { EditTag } from '../types/editTag.type'
import { SongType } from '../types/song.type'

/********************** Write Aac Tags **********************/
let tagWriteDeferredPromise: any = undefined

let exifToolWriteWorker: any = getWorker('exifToolWrite')?.on('message', (response: any) => {
	tagWriteDeferredPromise(response)
})

export function writeAacTags(filePath: string, newTags: any) {
	return new Promise((resolve, reject) => {
		newTags = normalizeNewTags(newTags)

		tagWriteDeferredPromise = resolve

		exifToolWriteWorker?.postMessage({ filePath, newTags })
	})
}

/********************** Read Aac Tags **********************/
let exifToolReadWorker: any = undefined

let tagReadDeferredPromises: Map<string, any> = new Map<string, any>()

export function getAacTags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		if (exifToolReadWorker === undefined) {
			exifToolReadWorker = getWorker('exifToolRead')

			exifToolReadWorker?.on('message', (response: any) => {
				tagReadDeferredPromises.get(response.filePath)(response.metadata)
				tagReadDeferredPromises.delete(response.filePath)
			})
		}

		const METADATA: any = await new Promise((resolve, reject) => {
			tagReadDeferredPromises.set(filePath, resolve)
			exifToolReadWorker?.postMessage(filePath)
		})

		const STATS = fs.statSync(filePath)

		let dateParsed = getDate(String(METADATA.CreateDate || METADATA.ContentCreateDate))

		resolve({
			ID: stringHash(filePath),
			Extension: METADATA.FileTypeExtension,
			SourceFile: METADATA.SourceFile || null,
			Album: METADATA.Album || null,
			AlbumArtist: METADATA.AlbumArtist || null,
			Artist: METADATA.Artist || null,
			Comment: METADATA.Comment || null,
			Composer: METADATA.Composer || null,
			Date_Year: dateParsed.year || null,
			Date_Month: dateParsed.month || null,
			DiscNumber: METADATA.DiskNumber || null,
			Date_Day: dateParsed.day || null,
			Genre: METADATA.Genre || null,
			Rating: METADATA.RatingPercent || null,
			Title: METADATA.Title || null,
			//@ts-expect-error
			Track: getTrack(METADATA.TrackNumber, METADATA.Track) || null,
			BitDepth: METADATA.AudioBitsPerSample || null,
			BitRate: getBitRate(METADATA.AvgBitrate) || null,
			Duration: METADATA.Duration || null,
			LastModified: STATS.mtimeMs,
			SampleRate: METADATA.AudioSampleRate || null,
			Size: STATS.size
		})
	})
}

function normalizeNewTags(newTags: EditTag) {
	if (newTags.DiscNumber !== undefined) renameObjectKey(newTags, 'DiscNumber', 'DiskNumber')
	if (newTags.Track !== undefined) renameObjectKey(newTags, 'Track', 'TrackNumber')
	if (newTags.Rating !== undefined) renameObjectKey(newTags, 'Rating', 'RatingPercent')

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
