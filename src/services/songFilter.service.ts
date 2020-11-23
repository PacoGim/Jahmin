import { getCollection } from './loki.service'

export function orderSongs(index: number, grouping: string[], filtering: string[]) {
	// Retrieves the songs from DB.
	let songs = getCollection()

	// Array returned at the end of the whole process of filtering.
	let tempArray: string[] = []

	// Array to be filtered again and again.
	let filteredArray = []

	// Iterates through from 0 to the component index to filter or group upwards.
	for (let i = 0; i <= index; i++) {
		// If no songs were filtered just use the array with all the songs.
		if (filteredArray.length === 0) {
			filteredArray = songs
		}

		// If i === index means that it should be grouping since user selection does not matter now.
		if (i === index) {
			// Grouping
			filteredArray.forEach((song) => {
				// Group by i or index since they match it should be grouped.
				// i === index -> 4 === 4 -> Group by Album Artist since it is the last grouping array element.
				let valueToGroupBy = song[grouping[i]]

				// Prevents data repetition / Grouping by logic.
				if (!tempArray.includes(valueToGroupBy)) {
					tempArray.push(valueToGroupBy)
				}
			})
		} else {
			let groupBy = grouping[i]
			let filterBy = filtering[i]

			filteredArray = filteredArray.filter((song: any) => {
				// If one of the filters is not defined or null, add the songs the the list anyway.
				if (filterBy === undefined || filterBy === null) {
					return true
				} else {
					return song[groupBy] === filterBy
				}
			})
		}
	}

	tempArray = tempArray.sort((a, b) => String(a).localeCompare(String(b)))

	return tempArray
}
