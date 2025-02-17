export default function (value: any, maxCharacters: number = 20) {
	value = String(value)

	if (value.length > maxCharacters) {
		return value.substring(0, maxCharacters) + '...'
	} else {
		return value
	}
}
