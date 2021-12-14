export default function isJson(str: string): boolean {
	try {
		if (typeof str !== 'object') {
			return false
		}

		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}
