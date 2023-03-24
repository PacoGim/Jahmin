export default function (json: string): any {
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
