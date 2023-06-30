import { SongType } from '../../types/song.type'
import { getDb } from './initDB.fn'

export function selectByKeyValue(key: string, value: string) {
	return new Promise((resolve, reject) => {
		getDb().get(`SELECT * FROM songs WHERE ${key} = ?`, [value], (err, row) => {
			if (err) {
				return reject(err)
			}
			resolve(row)
		})
	})
}

export function selectByIds(ids: number[] = []): Promise<SongType[] | null> {
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

export function selectColumns(columns: string[] = []): Promise<any[] | null> {
	return new Promise(resolve => {
		let query = columns.length > 0 ? `SELECT ${columns.join(',')} FROM songs` : `SELECT * FROM songs`

		getDb().all(query, [], (err, songs: any[]) => {
			if (err) {
				return resolve(null)
			}
			resolve(songs)
		})
	})
}
