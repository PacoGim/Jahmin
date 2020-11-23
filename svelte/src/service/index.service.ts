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
