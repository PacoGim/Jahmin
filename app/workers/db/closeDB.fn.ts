import { Database } from 'sqlite3'

import { getDb } from './initDB.fn'
import { setIsDBConnected } from '../functions/dbState.fn'

export default function () {
	let db: Database | null = getDb()

	if (db) {
		db.close(err => {
			if (err) {
				console.error(err.message)
			} else {
				// console.log('Closed the database connection.')
				db = null
				setIsDBConnected(false)
			}
		})
	} else {
		// console.log('No database connection to close.')
	}
}
