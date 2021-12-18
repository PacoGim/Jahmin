export default function isJson(str: string): boolean {
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
