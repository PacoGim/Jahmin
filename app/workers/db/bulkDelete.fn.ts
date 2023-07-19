import { SongType } from '../../types/song.type'
import { updateVersion } from './dbVersion.fn'
import { getDb } from './initDB.fn'

export default function (songsSourceFiles: string[]) {
	return new Promise((resolve, reject) => {
		const whereClause = `SourceFile IN (${songsSourceFiles.map(path => `"${path}"`).join(', ')})`

		const statement = `DELETE FROM songs WHERE ${whereClause}`

		getDb().run(statement, err => {
			if (err) {
				reject(err)
			} else {
				updateVersion()
				resolve(null)
			}
		})
	})
}
