// ©nam

export function getTitle(doc: any, extension: string) {
	let title = undefined

	if (extension === 'm4a') {
		title = doc['native']['iTunes'].find((i: any) => i['id'] === '©nam')

		if (title) return title['value']
	}

	return doc['common']['title'] || undefined
}
