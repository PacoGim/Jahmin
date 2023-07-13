import { SongType } from '../../types/song.type'
import { getDb } from './initDB.fn'

export function selectGeneric(queryData: {
	workerCallId: string
	select: string[]
	where?: { [key: string]: string }[]
	group?: string[]
	order?: string[]
}) {
	return new Promise((resolve, reject) => {
		let sqliteQuery = buildSqliteQuery(queryData)

		console.log(sqliteQuery)

		getDb().all(sqliteQuery, [], (err, songs: SongType[]) => {
			if (err) {
				return reject(err)
			}

			resolve({
				workerCallId: queryData.workerCallId,
				data: songs
			})
		})
	})
}

function buildSqliteQuery(queryData: {
	select: string[]
	andWhere?: { [key: string]: string }[]
	orWhere?: { [key: string]: string }[]
	group?: string[]
	order?: string[]
}) {
	let query = `SELECT ${queryData.select.join(',')} FROM songs`

	if (queryData.andWhere && queryData.andWhere.length > 0) {
		query += ` WHERE ${queryData.andWhere
			.map(where => {
				if (where[Object.keys(where)[0]] === 'not null') {
					return `${Object.keys(where)[0]} is not null`
				} else {
					return `${Object.keys(where)[0]} = "${where[Object.keys(where)[0]]}"`
				}
			})
			.join(' AND ')}`
	}

	if (queryData.orWhere && queryData.orWhere.length > 0) {
		query += ` WHERE ${queryData.orWhere
			.map(where => {
				if (where[Object.keys(where)[0]] === 'not null') {
					return `${Object.keys(where)[0]} is not null`
				} else {
					return `${Object.keys(where)[0]} = "${where[Object.keys(where)[0]]}"`
				}
			})
			.join(' OR ')}`
	}

	if (queryData.group) {
		query += ` GROUP BY ${queryData.group.join(',')}`
	}

	if (queryData.order) {
		query += ` ORDER BY ${queryData.order.join(',')}`
	}

	return query
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
