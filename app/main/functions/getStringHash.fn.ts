export default function (input: string) {
	let hash = 0

	for (let char of input) {
		hash += char.charCodeAt(0)
	}

	return hash.toString(36)
}