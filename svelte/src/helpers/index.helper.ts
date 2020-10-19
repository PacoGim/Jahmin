export function cutWord(word) {
	try {
		if (word.length >= 20) {
			return word.substr(0, 18) + '...'
		} else {
			return word
		}
	} catch (error) {
		return word
	}
}
