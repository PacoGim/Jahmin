import type { SongType } from '../../../types/song.type'
import { getDB } from './!dbObject'

export default function (songs: SongType[]): Promise<undefined> {
	return new Promise((resolve, reject) => {
		getDB().songs
			.bulkPut(songs)
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
