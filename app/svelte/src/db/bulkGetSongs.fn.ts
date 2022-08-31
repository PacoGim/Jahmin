import type { SongType } from '../../../types/song.type'
import { getDB } from './!dbObject'

export default function (ids: number[]): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		getDB().songs
			.bulkGet(ids)
			.then(songs => {
				resolve(songs)
			})
			.catch(err => {
				reject(err)
			})
	})
}
