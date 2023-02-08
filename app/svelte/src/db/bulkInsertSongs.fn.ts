import type { SongType } from '../../../types/song.type'
import { getDB } from './!dbObject'
import updateVersionFn from './updateVersion.fn'

export default function (songs: SongType[]): Promise<undefined> {
	return new Promise((resolve, reject) => {
		getDB().songs
			.bulkAdd(songs)
			.then(() => {
				// updateVersionFn()
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}
