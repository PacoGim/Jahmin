import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })
import fs from 'fs'
import stringHash from 'string-hash'
import { SongType } from '../types/song.type'

function writeAacTags(filePath: string, newTags: any) {
	exiftool.write(filePath, {
		//@ts-expect-error
		Album: 'New Album',
		AlbumArtist: 'New Album Artist',
		Artist: 'New Artist',
		Composer: 'New Composer',
		ContentCreateDate: new Date(),
		Genre: 'New Genre',
		Title: 'New Title',
		TrackNumber: 258,
		RatingPercent: 95,
		Comment: 'New Comment'
	})
	// let time = DateTime.fromISO('1999-01-01T01:01').toFormat('yyyy:mm:dd HH:MM:ss')
}

export function getAacTags(filePath: string): Promise<SongType> {
	return new Promise((resolve, reject) => {
		exiftool.read(filePath).then((tags) => {
			fs.stat(filePath, (err, fileStats) => {
				// let fileStats = fs.statSync(filePath)

				//@ts-expect-error
				let dateParsed = getDate(String(tags.ContentCreateDate))

				resolve({
					ID: stringHash(filePath),
					//@ts-expect-error
					Album: tags['Album'] || '',
					//@ts-expect-error
					AlbumArtist: tags['AlbumArtist'] || '',
					Artist: tags['Artist'] || '',
					//@ts-expect-error
					Composer: tags['Composer'] || '',
					// Date: tags['ContentCreateDate'],
					//@ts-expect-error
					Genre: tags['Genre'] || '',
					//@ts-expect-error
					DiscNumber: tags['DiskNumber'] || null,
					Title: tags['Title'] || '',
					//@ts-expect-error
					Track: getTrack(tags['TrackNumber'], tags['Track'])||null,
					Rating: tags['RatingPercent'] || 0,
					Date_Year: dateParsed['year'] || null,
					Date_Month: dateParsed['month'] || null,
					Date_Day: dateParsed['day'] || null,
					Comment: tags['Comment'] || '',
					SourceFile: tags['SourceFile'] || '',
					Extension: tags['FileTypeExtension'],
					Size: fileStats.size,
					Duration: tags['Duration'],
					SampleRate: tags['AudioSampleRate'],
					LastModified: fileStats.mtimeMs,
					BitRate: getBitRate(tags['AvgBitrate']),
					BitDepth: tags['AudioBitsPerSample']
				})
			})
		})
	})
}

function getBitRate(bitRate: string | undefined) {
	if (bitRate) {
		return Number(bitRate.replace(/\D/g, ''))
	} else {
		return undefined
	}
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

function getTrack(...trackValues: [string | number]) {
	let numberedTrackFound = trackValues.find((i) => typeof i === 'number')

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
