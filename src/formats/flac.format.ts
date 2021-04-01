import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import stringHash from 'string-hash'
import { SongType } from '../types/song.type'
import { StreamSongType } from '../types/streamTag.type'
import { TagType } from '../types/tag.type'
import { TagModType } from '../types/tagMod.type'

let ffprobePath = () => {
	return path.join(__dirname, '../binaries', 'ffprobe')
}

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

export function getFlacTags(filePath: string): Promise<SongType> {
	return new Promise((resolve, reject) => {
		exec(`"${ffprobePath()}" -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
			if (stdout) {
				let tags: SongType = {
					Extension: 'flac'
				}
				let data = JSON.parse(stdout)

				tags['ID'] = stringHash(filePath)

				let streamAudioData: StreamSongType = data['streams'].find((stream: StreamSongType) => stream['codec_type'] === 'audio')

				tags['SourceFile'] = filePath
				tags['SampleRate'] = Number(streamAudioData['sample_rate'])
				tags['BitDepth'] = Number(streamAudioData['bits_per_raw_sample'])

				data = data['format']

				tags['BitRate'] = Number(data['bit_rate'])
				tags['Duration'] = Number(data['duration'])
				tags['Size'] = Number(data['size'])

				let dataTags = lowerCaseObjectKeys(data['tags'])

				let dateParsed = getDate(dataTags['date'])

				tags['Rating'] = Number(dataTags['rating'])
				tags['Title'] = dataTags['title']
				tags['Artist'] = dataTags['artist']
				tags['Album'] = dataTags['album']
				tags['Genre'] = dataTags['genre']
				tags['Comment'] = dataTags['comment']
				tags['AlbumArtist'] = dataTags['album_artist']
				tags['Composer'] = dataTags['composer']
				tags['DiscNumber'] = dataTags['disc'] !== undefined ? Number(dataTags['disc']) : undefined
				tags['Date_Year'] = dateParsed['year']
				tags['Date_Month'] = dateParsed['month']
				tags['Date_Day'] = dateParsed['day']
				tags['Track'] = Number(dataTags['track'])

				tags['LastModified'] = fs.statSync(filePath).mtimeMs

				resolve(tags)
			}

			if (err) {
				console.log(err)
			}
		})
	})
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
