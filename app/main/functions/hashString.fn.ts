const stringHash = require('string-hash')

export default function(stringToHash: string, format: 'number' | 'text' = 'text'): string | number {
	if (format === 'text') {
		return stringHash(stringToHash).toString(36)
	} else {
		return stringHash(stringToHash)
	}
}
