import { PartialSongType } from '../../types/song.type'
import { updateVersion } from './dbVersion.fn'
import { getDb } from './initDB.fn'

export default function (songs: { songId: string | number; newTags: PartialSongType }[]) {
	return new Promise((resolve, reject) => {
		// Will contain songs grouped by the same new tags to update.
		let updateGroups: any[] = []

		// Iterates through each song gets the id and new tags to update.
		songs.forEach(({ songId, newTags }) => {
			// Stringyfies the new tags to use as key for the updateGroups object array.
			let objectKey = JSON.stringify(newTags)

			// Checks if the updateGroups already contains the object key a.k.a. the stringyfied new tags object.
			let findGroup = updateGroups.find(group => group.id === objectKey)

			// If the group already exists, add the song id to the array of songs id.
			if (findGroup) {
				findGroup.songsId.push(songId)
			} else {
				// If the group doesn't exist, create it.
				updateGroups.push({
					id: objectKey, // The stringyfied new tags object that serves as key id.
					newTags, // The new tags object to know the new tags to update.
					songsId: [songId] // The array of songs id to update.
				})
			}
		})

		// Since multiple bulk update will run, it needs to wait for all the updates to finish before resolving.
		let bulkUpdatePromises: any[] = []

		// Iterates through each group of songs to update and add the promises to the bulk update promises array.
		updateGroups.forEach(group => {
			const setClause = Object.entries(group.newTags)
				.map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
				.join(', ')

			const whereClause = `id IN (${group.songsId.join(', ')})`

			const updateStatement = `UPDATE songs SET ${setClause} WHERE ${whereClause}`

			bulkUpdatePromises.push(runUpdate(updateStatement))
		})

		// When all promises are done, then update version, catch errors and finally resolve.
		Promise.all(bulkUpdatePromises)
			.then(x => {
				updateVersion()
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}

function runUpdate(statement: string) {
	return new Promise((resolve, reject) => {
		getDb().run(statement, err => {
			if (err) {
				reject(err)
			} else {
				resolve('Update successful')
			}
		})
	})
}
