export default function (songArtist: string | undefined | null, songAlbumArtist: string | undefined | null) {
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
