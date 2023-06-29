import { SongType } from '../../types/song.type'
import { getDb } from './initDB.fn'

export default function (ids: number[] = []): Promise<SongType[] | null> {
	return new Promise(resolve => {
		let query = ids.length > 0 ? `SELECT * FROM songs WHERE ID IN (${ids.join(',')})` : `SELECT * FROM songs`

		getDb().all(query, [], (err, songs: SongType[]) => {
			if (err) {
				return resolve(null)
			}

			resolve(songs)
		})
	})
}
