export default function (json: string): any {
	try {
		return JSON.parse(json)
	} catch (e) {
		return {}
	}
}
