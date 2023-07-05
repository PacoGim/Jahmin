export default function (songArray: any[], album: string | undefined | null) {
	let artistsCount: any[] = []
	let artistsConcat: any[] = []
	let artistsSorted: string = ''

  console.log(songArray)

	songArray.forEach(song => {

    console.log(song)

		if (song.Album === album) {
			let artists = splitArtists(song.Artist)

			if (artists.length > 0) {
				artistsConcat.push(...artists)
			} else {
				artistsConcat = artists
			}
		}
	})

	artistsConcat.forEach(artist => {
		let foundArtist = artistsCount.find(i => i.Artist === artist)

		if (foundArtist) {
			foundArtist.Count++
		} else {
			artistsCount.push({
				Artist: artist,
				Count: 0
			})
		}
	})

	artistsCount = artistsCount.sort((a, b) => b['Count'] - a['Count'])
	artistsSorted = artistsCount.map(a => a['Artist']).join(', ')

	return artistsSorted
}

function splitArtists(artists: string) {
	console.log(artists)
	if (artists) {
		let artistSplit: string[] = []

		if (typeof artists === 'string') {
			artistSplit = artists.split(', ')
			artistSplit = artists.split(',')
		}

		return artistSplit
	}
	return []
}
