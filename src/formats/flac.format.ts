import { exec } from 'child_process'
import fs from 'fs'
import { lowerCaseObjectKeys } from '../functions/lowerCaseObjectKeys.fn'
import { objectToFfmpegString } from '../functions/objectToFfmpegString.fn'
import { FlacStreamTagType } from '../types/flacStreamTag.type'
import { TagType } from '../types/tag.type'


function writeFlacTags(filePath: string) {
	return new Promise((resolve, reject) => {
		// ffmpeg -i aiff.aiff -map 0 -y -codec copy -write_id3v2 1 -metadata "artist-sort=emon feat sort" aiffout.aiff

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

		console.log(ffmpegMetatagString)

		exec(
			`./binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec copy -write_id3v2 1 ${ffmpegMetatagString} "./out/${filePath
				.split('/')
				.pop()}"`,
			(error, stdout, stderr) => {
				if (error) {
					// console.log(error)
				}

				if (stdout) {
					console.log(stdout)
				}

				if (stderr) {
					console.log(stderr)
				}
			}
		)
	})
}

function getFlacTags(filePath: string) {
	return new Promise((resolve, reject) => {
		exec(`./binaries/ffprobe -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
			if (stdout) {
				let tags: TagType = {
					Extension: 'flac'
				}
				let data = JSON.parse(stdout)
				let streamAudioData: FlacStreamTagType = data['streams'].find(
					(stream: FlacStreamTagType) => stream['codec_type'] === 'audio'
				)

				tags['SourceFile'] = filePath
				tags['SampleRate'] = Number(streamAudioData['sample_rate'])
				tags['BitDepth'] = Number(streamAudioData['bits_per_raw_sample'])
				tags['BitRate'] = Number(streamAudioData['bit_rate'])

				data = data['format']

				tags['Duration'] = Number(data['duration'])
				tags['Size'] = Number(data['size'])

				let dataTags = lowerCaseObjectKeys(data['tags'])

				tags['Rating'] = Number(dataTags['rating'])
				tags['Title'] = dataTags['title']
				tags['Artist'] = dataTags['artist']
				tags['Album'] = dataTags['album']
				tags['Genre'] = dataTags['genre']
				tags['Comment'] = dataTags['comment']
				tags['AlbumArtist'] = dataTags['album_artist']
				tags['Composer'] = dataTags['composer']
				tags['DiscNumber'] = dataTags['disc']
				tags['Year'] = Number(dataTags['year'])
				tags['Date'] = dataTags['date']
				tags['Track'] = dataTags['track']

				tags['LastModified'] = fs.statSync(filePath).mtimeMs

				console.log(tags)
			}
		})
	})
}