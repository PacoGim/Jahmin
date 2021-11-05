export function getComposer(doc: any) {
	try {
		let composer = doc['common']['composer']
		if (typeof composer === 'object') composer = composer[0]
		return composer

	} catch (error) {
		return ''
	}
}
