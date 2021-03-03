import { exec } from 'child_process'
import fs from 'fs'
import { lowerCaseObjectKeys } from '../functions/lowerCaseObjectKeys.fn'
import { objectToFfmpegString } from '../functions/objectToFfmpegString.fn'
import { FlacStreamSongType } from '../types/flacStreamTag.type'
import { SongType } from '../types/song.type'

function writeMp3Tags(filePath: string) {
	return new Promise((resolve, reject) => {
		let ffmpegMetatagString = objectToFfmpegString({
			title: 'New Title',
			rating: 90,
			track: 301,
			album: 'New Album',
			artist: 'New Artist',
			album_artist: 'New Album Artist',
			composer: 'New Composer',
			genre: 'New Genre',
			year: 2002,
			date: '2008',
			comment: 'New Comment',
			disc: 9
		})

		exec(
			`./binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec copy -write_id3v2 1 ${ffmpegMetatagString} "./out/${filePath
				.split('/')
				.pop()}"`,
			(error, stdout, stderr) => {
				if (error) {
					// console.log(error)
				}

				if (stdout) {
					// console.log(stdout)
				}

				if (stderr) {
					// console.log(stderr)
				}
			}
		)
	})
}

export function getMp3Tags(filePath: string): Promise<SongType> {
	return new Promise((resolve, reject) => {
		exec(`./binaries/ffprobe -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
			if (stdout) {
				let tags: SongType = {
					Extension: 'mp3'
				}
				let data = JSON.parse(stdout)

				// console.log(data)

				let streamAudioData: FlacStreamSongType = data['streams'].find(
					(stream: FlacStreamSongType) => stream['codec_type'] === 'audio'
				)

				tags['SourceFile'] = filePath
				tags['SampleRate'] = Number(streamAudioData['sample_rate'])
				tags['BitRate'] = streamAudioData['bit_rate']
				tags['BitDepth'] = Number(streamAudioData['bits_per_raw_sample'])

				data = data['format']

				tags['Duration'] = Number(data['duration'])
				tags['Size'] = Number(data['size'])

				let dataTags = lowerCaseObjectKeys(data['tags'])

				tags['Rating'] = Number(dataTags['rating'])
				tags['Rating'] = dataTags['rating']
				tags['Title'] = dataTags['title']
				tags['Artist'] = dataTags['artist']
				tags['Album'] = dataTags['album']
				tags['Genre'] = dataTags['genre']
				tags['Comment'] = dataTags['comment']
				tags['AlbumArtist'] = dataTags['album_artist']
				tags['Composer'] = dataTags['composer']
				tags['DiscNumber'] = dataTags['disc']
				tags['Year'] = Number(dataTags['date'])
				tags['Date'] = dataTags['date']
				tags['Track'] = dataTags['track']

				tags['LastModified'] = fs.statSync(filePath).mtimeMs

				resolve(tags)
			}
		})
	})
}
