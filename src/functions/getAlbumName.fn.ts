export function getAlbumName(doc: any, extension: string) {
	let albumName = undefined

	if (extension === 'm4a') {
		albumName = doc['native']['iTunes'].find((i: any) => i['id'] === '©alb')

		if (albumName) return albumName['value']
	}

	return doc['common']['album'] || undefined
}
