export default function (str: string) {
	if (typeof str !== 'string') {
		return str
	}

	if (!isNaN(Number(str))) {
		return Number(str)
	}

	try {
		return JSON.parse(str)
	} catch (e) {}

	return str
}
