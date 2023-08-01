import type { SongType } from '../../../types/song.type'

export default (songs: SongType[], tag, order: 'asc' | 'desc' = 'desc', group = undefined) => {
	let songsArrayCopy = [...songs]

	if (['Duration', 'Track', 'Size', 'Sample Rate', 'Rating', 'Disc #', 'BitRate', 'PlayCount','SampleRate'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => Number(a[tag] || 0) - Number(b[tag] || 0))
		} else {
			songsArrayCopy.sort((a, b) => Number(b[tag] || 0) - Number(a[tag || 0]))
		}
	}

	if (['Artist', 'Comment', 'Composer', 'Extension', 'Genre', 'Title','Album'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => String(a[tag]).localeCompare(String(b[tag]), undefined, { numeric: true }))
		} else {
			songs = songsArrayCopy.sort((a, b) => String(b[tag]).localeCompare(String(a[tag]), undefined, { numeric: true }))
		}
	}

	if (['Date'].includes(tag)) {
		if (order === 'asc') {
			songsArrayCopy.sort((a, b) => {
				let dateA = Date.UTC(a.DateYear, (a.DateMonth | 1) - 1, a.DateDay | 1)
				let dateB = Date.UTC(b.DateYear, (b.DateMonth | 1) - 1, b.DateDay | 1)

				return dateA - dateB
			})
		} else {
			songsArrayCopy.sort((a, b) => {
				let dateA = Date.UTC(a.DateYear, (a.DateMonth | 1) - 1, a.DateDay | 1)
				let dateB = Date.UTC(b.DateYear, (b.DateMonth | 1) - 1, b.DateDay | 1)

				return dateB - dateA
			})
		}
	}

	if (group) {
		// group.groupBy.forEach((_, index) => {
			songsArrayCopy = songsArrayCopy.filter(song => song[group.groupBy] === group.groupByValue)
		// })
	}

	return songsArrayCopy
}
