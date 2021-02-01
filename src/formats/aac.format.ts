import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })
import { DateTime } from 'luxon'


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

function getAacTags(filePath: string) {
	return new Promise((resolve, reject) => {
		exiftool.read(filePath).then((tags) => {
			resolve({
				//@ts-expect-error
				Album: tags['Album'],
				//@ts-expect-error
				AlbumArtist: tags['AlbumArtist'],
				Artist: tags['Artist'],
				//@ts-expect-error
				Composer: tags['Composer'],
				//@ts-expect-error
				Date: tags['ContentCreateDate']['rawValue'],
				//@ts-expect-error
				Genre: tags['Genre'],
				//@ts-expect-error
				DiskNumber: tags['DiskNumber'],
				Title: tags['Title'],
				//@ts-expect-error
				Track: tags['TrackNumber'],
				Rating: tags['RatingPercent'],
				//@ts-expect-error
				Year: DateTime.fromISO(tags['ContentCreateDate']['rawValue']).toFormat('YYYY'),
				Comment: tags['Comment'],
				SourceFile: tags['SourceFile'],
				Extension: tags['FileTypeExtension'],
				Size: tags['MediaDataSize'],
				Duration: tags['Duration'],
				SampleRate: tags['AudioSampleRate'],
				//@ts-expect-error
				LastModified: tags['LastModified'],
				BitRate: tags['AvgBitrate'],
				BitDepth: tags['AudioBitsPerSample']
			})
		})
	})
}