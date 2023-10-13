import sanitizeFilePath from 'sanitize-filename'
import validateSafeFileCharsFn from './validateSafeFileChars.fn'

export default function (input: string): { isValid: boolean; errorMessage?: string } {
	if (input === 'Default') {
		return { isValid: false, errorMessage: 'Default profile name is reserved.' }
	}

	if (input === '') {
		return { isValid: false, errorMessage: "Profile name can't be empty." }
	}

	if (sanitizeFilePath(input) !== input) {
		return validateSafeFileCharsFn(input)
	}

	return { isValid: true }
}
