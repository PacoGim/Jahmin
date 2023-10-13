export default function (inputJSON: any) {
	try {
		return JSON.parse(inputJSON)
	} catch (e) {
		return {}
	}
}
