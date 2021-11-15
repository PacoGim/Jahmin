export function cutWord(word, maxLength) {
	try {
		if (word.length >= maxLength) {
			return word.substr(0, maxLength - 1) + '...'
		} else {
			return word
		}
	} catch (error) {
		return word
	}
}

export function objectToArray(inObject: object) {
	let tempArray = []
	for (const key in inObject) {
		tempArray.push(inObject[key])
	}
	return tempArray
}
