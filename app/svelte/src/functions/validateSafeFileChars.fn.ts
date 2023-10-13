import sanitizeFilePath from 'sanitize-filename'

export default function (input: string): { isValid: boolean; errorMessage?: string } {
	if (sanitizeFilePath(input) !== input) {
		return { isValid: false, errorMessage: 'Avoid weird characters like / ? < >  : * | " please' }
	} else if (input.length === 0 || input === '') {
		return { isValid: false, errorMessage: 'Please enter a name' }
	}

	return { isValid: true }
}
