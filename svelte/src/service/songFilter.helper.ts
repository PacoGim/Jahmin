import { songIndex } from '../store/index.store'

export function filterSongs(valuesToGroupBy, valuesToFilterBy, index) {
	let songArray
	let outputArray = []

	songIndex.subscribe((value) => (songArray = value))()

	for (let i = 0; i <= index; i++) {
		// If i === index means that it should be grouping since user selection does not matter now.
		if (i === index) {
			// Groups

			// If no filtering done then use the array with all songs.
			if (outputArray.length === 0) {
				songArray.forEach((song) => {
					// If that prevents redundant data.
					if (!outputArray.includes(song[valuesToGroupBy[i]])) {
						outputArray.push(song[valuesToGroupBy[i]])
					}
				})
			} else {
				let tempArray = []

				outputArray.forEach((song) => {
					// If that prevents redundant data.
					if (!tempArray.includes(song[valuesToGroupBy[i]])) {
						if (song[valuesToGroupBy[i]] !== undefined) {
							tempArray.push(song[valuesToGroupBy[i]])
						}
					}
				})
				outputArray = tempArray
			}
		} else {
			// Filters
			let groupBy = valuesToGroupBy[i]
			let filterBy = valuesToFilterBy[i]

			if (outputArray.length === 0) {
				outputArray = songArray.filter((song) => song[groupBy] === filterBy)
			} else {
				outputArray = outputArray.filter((song) => {
					if (filterBy === undefined) {
						return true
					} else {
						return song[groupBy] === filterBy
					}
				})
			}
		}
	} // for end

	outputArray = outputArray.sort((a, b) => String(a).localeCompare(String(b)))

	return outputArray
}
