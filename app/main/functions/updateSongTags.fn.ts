import { writeAacTags } from '../formats/aac.format'
import { writeFlacTags } from '../formats/flac.format'
import { writeMp3Tags } from '../formats/mp3.format'
import { writeOpusTags } from '../formats/opus.format'
import { watchPaths } from '../services/chokidar.service'
import getFileExtensionFn from './getFileExtension.fn'

let processTimeoutMap = new Map<string, NodeJS.Timeout>()

export default function (songPath: string, newTags: any): Promise<0 | 1 | -1> {
	return new Promise((resolve, reject) => {
		let extension = getFileExtensionFn(songPath)

		if (extension === undefined) {
			return reject(new Error('Invalid file path'))
		}

		if (extension === 'opus') {
			writeOpusTags(songPath, newTags)
				.then(response => {
					resolve(response)
				})
				.catch(err => reject(err))
		} else if (extension === 'mp3') {
			writeMp3Tags(songPath, newTags)
				.then(response => resolve(response))
				.catch(err => reject(err))
		} else if (extension === 'flac') {
			writeFlacTags(songPath, newTags)
				.then(response => resolve(response))
				.catch(err => reject(err))
		} else if (extension === 'm4a') {
			writeAacTags(songPath, newTags)
				.then(response => resolve(response))
				.catch(err => reject(err))
		} else {
			return reject(new Error('Invalid file path'))
		}

		let timeout = processTimeoutMap.get(songPath)

		if (timeout) clearTimeout(timeout)

		processTimeoutMap.set(
			songPath,
			setTimeout(() => {
				watchPaths([songPath])
			}, 10000)
		)
	})
}
