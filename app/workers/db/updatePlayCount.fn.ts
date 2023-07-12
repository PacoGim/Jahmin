import { getDb } from './initDB.fn'

// Export a default function that takes an object with update, where, and workerCallId properties as an argument
export default function (data: { update: { PlayCount: number }; where: { ID: number }; workerCallId: string }) {
	// Return a new Promise
	return new Promise((resolve, reject) => {
		// Create an SQL update statement using the data provided in the argument
		const updateStatement = `UPDATE songs SET PlayCount = ${data.update.PlayCount} WHERE id = ${data.where.ID}`

		// Run the update statement on the database
		getDb().run(updateStatement, (thi: any, err: any) => {
			// If there is an error, reject the Promise with the error
			if (err) {
				reject(err)
			} else {
				// Otherwise, resolve the Promise with an object containing the workerCallId and updated data
				resolve({
					workerCallId: data.workerCallId,
					data: {
						ID: data.where.ID,
						PlayCount: data.update.PlayCount
					}
				})
			}
		})
	})
}
