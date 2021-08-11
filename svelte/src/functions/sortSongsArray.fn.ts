export default (songs, tag, order) => {
	if (['Duration', 'Track', 'Size', 'Sample Rate', 'Rating', 'Disc #', 'BitRate'].includes(tag)) {
		if (order === 1) {
			songs = songs.sort((a, b) => a[tag] - b[tag])
		} else {
			songs = songs.sort((a, b) => b[tag] - a[tag])
		}
	}

	if (['Artist', 'Comment', 'Composer', 'Extension', 'Genre', 'Title'].includes(tag)) {
		// console.log(data)
		if (order === 1) {
			songs = songs.sort((a, b) => a[tag].localeCompare(b[tag], undefined, { numeric: true }))
		} else {
			songs = songs.sort((a, b) => b[tag].localeCompare(a[tag], undefined, { numeric: true }))
		}
	}

	if (['Date'].includes(tag)) {
		if (order === 1) {
			songs.sort((a, b) => {
				let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
				let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

				return dateA - dateB
			})
		} else {
			songs.sort((a, b) => {
				let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
				let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

				return dateB - dateA
			})
		}
	}

	return songs
}
