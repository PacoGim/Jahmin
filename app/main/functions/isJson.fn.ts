export default function (o: object) {
	try {
		JSON.stringify(o)
		return true
	} catch (error) {
		return false
	}
}
