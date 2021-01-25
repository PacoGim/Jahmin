export function getAlbumArtist(doc: any, extension: string) {
	let albumArtist = undefined

	if (extension === 'm4a') {
		albumArtist = doc['native']['iTunes'].filter((i: any) => i['id'] === 'aART').map((i: any) => i['value']).join('\\\\')

		if (albumArtist) return albumArtist
	}

	return doc['common']['albumartist'] || undefined
}
