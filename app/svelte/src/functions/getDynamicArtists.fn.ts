export default function (songArtist: string, songAlbumArtist: string) {
	if (!songArtist || !songAlbumArtist) {
		return ''
	}

	let dynamicArtists = ''
	let splitArtists = songArtist.split('//').filter(artist => !songAlbumArtist.includes(artist))

	if (splitArtists.length > 0) {
		dynamicArtists = `(feat. ${splitArtists.join('//')})`
	} else {
		dynamicArtists = ''
	}

	return dynamicArtists
}
