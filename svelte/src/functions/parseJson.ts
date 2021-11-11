export default function parseJson(json: string): any {
	try {
		return JSON.parse(json)
	} catch (e) {
		return {}
	}
}
