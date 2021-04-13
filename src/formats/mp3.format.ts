import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

import stringHash from 'string-hash'
import { SongType } from '../types/song.type'
import { TagType } from '../types/tag.type'
import { TagModType } from '../types/tagMod.type'

import NodeID3 from 'node-id3'
import { TagModMp3Type } from '../types/tagModMp3.type'
import { Mp3TagType } from '../types/mp3TagType'

const mm = require('music-metadata')

/*
writeMp3Tags(
	{
		TIT2: 'New Title',
		TRCK: 4,
		TALB: 'New Album',
		TPE2: 'New Album Artist',
		TPE1: 'New Artist',
		comment: {
			language: 'eng',
			text: 'this is a comment'
		},
		TCOM: 'New Composer',
		TDRC: '1998-12-12',
		TPOS: 3,
		TCON: 'New Genre',
		popularimeter: {
			email: 'foo@bar.baz',
			rating: 100,
			counter: 0
		}
	},
	'/Users/fran/MEGA/Projects/Temp Project/ffmpeg-tag-read-write/input.mp3'
).then(() => getMp3Tags('/Users/fran/MEGA/Projects/Temp Project/ffmpeg-tag-read-write/input.mp3'))
*/

function writeMp3Tags(newTags: TagModMp3Type, filePath: string) {
	return new Promise((resolve, reject) => {
		NodeID3.write(newTags, filePath, (err) => {
			if (err) {
				console.log(err)
				reject()
			} else {
				resolve()
			}
		})
	})
}

export async function getMp3Tags(filePath: string): Promise<SongType> {
	return new Promise(async (resolve, reject) => {
		let tags: SongType = {
			Extension: 'mp3'
		}

		const STATS = fs.statSync(filePath)
		const METADATA = await mm.parseFile(filePath)
		let nativeTags: Mp3TagType = mergeNatives(METADATA.native)

		let dateParsed = getDate(String(nativeTags.TDRC || nativeTags.TYER))

		tags.LastModified = STATS.mtimeMs
		tags.Size = STATS.size
		tags.SourceFile = filePath
		tags.SampleRate = METADATA.format.sampleRate
		tags.BitRate = METADATA.format.bitrate / 1000
		tags.Duration = Math.trunc(METADATA.format.duration)

		tags.Album = nativeTags?.TALB
		tags.Artist = nativeTags?.TPE1
		tags.AlbumArtist = nativeTags?.TPE2
		tags.Comment = nativeTags?.COMM?.text
		tags.Composer = nativeTags?.TCOM
		tags.Date_Year = dateParsed.year
		tags.Date_Month = dateParsed.month
		tags.Date_Day = dateParsed.day
		tags.DiscNumber = Number(nativeTags?.TPOS) || undefined
		tags.Track = Number(nativeTags?.TRCK) || undefined
		tags.Title = nativeTags?.TIT2
		tags.Genre = nativeTags?.TCON
		tags.Rating = convertRating('Jahmin', nativeTags?.POPM?.rating)
		tags.ID = stringHash(filePath)

		resolve(tags)
	})
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
			finalObject[native[key][value]['id']] = native[key][value]['value']
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
