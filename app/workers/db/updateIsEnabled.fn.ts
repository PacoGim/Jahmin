import { DatabaseResponseType } from '../../types/databaseWorkerMessage.type'
import { updateVersion } from './dbVersion.fn'
import { getDb } from './initDB.fn'

// Export a default function that takes an object with update, where, and workerCallId properties as an argument
export default function (data: { update: { IsEnabled: number }; where: { ids: number[] }; workerCallId: string }) {
	// Return a new Promise

	const whereClause = `id IN (${data.where.ids.join(', ')})`

	const updateStatement = `UPDATE songs SET IsEnabled = ${data.update.IsEnabled} WHERE ${whereClause}`

	getDb().run(updateStatement, err => {
		if (err) {
		} else {
			updateVersion()
		}
	})
}
