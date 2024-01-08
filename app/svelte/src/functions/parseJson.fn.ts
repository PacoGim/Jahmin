export default function (json: string | null): any {
	if (json === null) {
		return undefined
	}

	try {
		return JSON.parse(json)
	} catch (e) {
		if (json === 'undefined' || json === undefined) {
			return undefined
		} else {
			return {}
		}
	}
}
