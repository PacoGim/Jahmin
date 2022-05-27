import type { SongType } from '../types/song.type'

export default (songs: SongType[], tag, order) => {
	let songsArrayCopy = [...songs]

	if (['Duration', 'Track', 'Size', 'Sample Rate', 'Rating', 'Disc #', 'BitRate', 'PlayCount'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => Number(a[tag] || 0) - Number(b[tag] || 0))
		} else {
			songsArrayCopy.sort((a, b) => Number(b[tag] || 0) - Number(a[tag || 0]))
		}
	}

	if (['Artist', 'Comment', 'Composer', 'Extension', 'Genre', 'Title'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => String(a[tag]).localeCompare(String(b[tag]), undefined, { numeric: true }))
		} else {
			songs = songsArrayCopy.sort((a, b) => String(b[tag]).localeCompare(String(a[tag]), undefined, { numeric: true }))
		}
	}

	if (['Date'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => {
				let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
				let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

				return dateA - dateB
			})
		} else {
			songsArrayCopy.sort((a, b) => {
				let dateA = Date.UTC(a.Date_Year, (a.Date_Month | 1) - 1, a.Date_Day | 1)
				let dateB = Date.UTC(b.Date_Year, (b.Date_Month | 1) - 1, b.Date_Day | 1)

				return dateB - dateA
			})
		}
	}

	return songsArrayCopy
}
