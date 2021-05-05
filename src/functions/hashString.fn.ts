import stringHash from 'string-hash'

export function hash(stringToHash: string, format: 'number' | 'text' = 'text') {
	if (format === 'text') {
		return stringHash(stringToHash).toString(36)
	} else {
		return stringHash(stringToHash)
	}
}
