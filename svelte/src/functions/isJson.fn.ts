export default function isJson(str: string): boolean {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}
