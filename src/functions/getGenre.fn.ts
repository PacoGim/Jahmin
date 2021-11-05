export function getGenre(doc: any, extension: string) {
	try {
		if (extension === 'm4a') {
			let genre

			genre = doc['native']['iTunes'].find((i: any) => i['id'] === '©gen')

			if (genre === undefined || genre?.['value'] === '') {
				genre = doc['native']['iTunes'].find((i: any) => i['id'] === 'gnre')
			}

			if (genre) return genre['value']
		}

		let genre = doc['common']['genre']
		if (typeof genre === 'object') genre = genre[0]
		return genre

	} catch (error) {
		return ''
	}
}