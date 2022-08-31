import { SongType } from '../../types/song.type'
import { getAacTags } from '../formats/aac.format'
import { getFlacTags } from '../formats/flac.format'
import { getMp3Tags } from '../formats/mp3.format'
import { getOpusTags } from '../formats/opus.format'
import getFileExtensionFn from './getFileExtension.fn'

export default function (songPath: string): Promise<SongType | null> {
	return new Promise((resolve, reject) => {
		let extension = getFileExtensionFn(songPath)

		if (extension === undefined) {
			return reject(new Error('Invalid file path'))
		}

		if (extension === 'opus') {
			getOpusTags(songPath)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'mp3') {
			getMp3Tags(songPath)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'flac') {
			getFlacTags(songPath)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else if (extension === 'm4a') {
			getAacTags(songPath)
				.then(tags => resolve(tags))
				.catch(err => reject(err))
		} else {
			resolve(null)
		}
	})
}

