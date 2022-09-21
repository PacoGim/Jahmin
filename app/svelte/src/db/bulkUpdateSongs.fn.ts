import deepmerge from 'deepmerge'
import type { PartialSongType, SongType } from '../../../types/song.type'
import { songListStore } from '../stores/main.store'
import { getDB } from './!dbObject'
import updateVersionFn from './updateVersion.fn'

export default function (songs: { id: string | number; newTags: PartialSongType }[]) {
	return new Promise((resolve, reject) => {
		updateVariables(songs)

		// Will contain songs grouped by the same new tags to update.
		let updateGroups = []

		// Iterates through each song gets the id and new tags to update.
		songs.forEach(({ id, newTags }) => {
			// Stringyfies the new tags to use as key for the updateGroups object array.
			let objectKey = JSON.stringify(newTags)

			// Checks if the updateGroups already contains the object key a.k.a. the stringyfied new tags object.
			let findGroup = updateGroups.find(group => group.id === objectKey)

			// If the group already exists, add the song id to the array of songs id.
			if (findGroup) {
				findGroup.songsId.push(id)
			} else {
				// If the group doesn't exist, create it.
				updateGroups.push({
					id: objectKey, // The stringyfied new tags object that serves as key id.
					newTags, // The new tags object to know the new tags to update.
					songsId: [id] // The array of songs id to update.
				})
			}
		})

		// Since multiple bulk update will run, it needs to wait for all the updates to finish before resolving.
		let bulkUpdatePromises = []

		// Iterates through each group of songs to update and add the promises to the bulk update promises array.
		updateGroups.forEach(group => {
			bulkUpdatePromises.push(getDB().songs.where('ID').anyOf(group.songsId).modify(group.newTags))
		})

		// When all promises are done, then update version, catch errors and finally resolve.
		Promise.all(bulkUpdatePromises)
			.then(x => {
				updateVersionFn()
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}

function updateVariables(songs: { id: string | number; newTags: PartialSongType }[]) {
	let songListStoreLocal: SongType[] = undefined

	songListStore.subscribe(value => (songListStoreLocal = value))()

	songs.forEach(song => {
		let arraySongIndex = songListStoreLocal.findIndex(a => a.ID === song.id)

		if (arraySongIndex !== -1) {
			songListStoreLocal[arraySongIndex] = deepmerge(songListStoreLocal[arraySongIndex], song.newTags)
		}
	})

	songListStore.set(songListStoreLocal)
}
