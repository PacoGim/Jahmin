import { getDb } from './initDB.fn'

// Export a default function that takes an object with update, where, and workerCallId properties as an argument
export default function (data: { update: { IsEnabled: number }; where: { IDs: number[] }; workerCallId: string }) {
	// Return a new Promise
	return new Promise((resolve, reject) => {
		const whereClause = `id IN (${data.where.IDs.join(', ')})`

		const updateStatement = `UPDATE songs SET IsEnabled = ${data.update.IsEnabled} WHERE ${whereClause}`

		getDb().run(updateStatement, err => {
			if (err) {
				reject(err)
			} else {
				resolve('Update successful')
			}
		})
	})
}
