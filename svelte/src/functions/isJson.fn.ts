export default function isJson(str: string|object): boolean {
	try {
		if (typeof str === 'object') {
			return true
		}

		JSON.parse(str)
		return true
	} catch (e) {
		return false
	}
}
