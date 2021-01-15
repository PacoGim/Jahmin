import stringHash from 'string-hash'

export function hash(stringToHash: string) {
	return stringHash(stringToHash).toString(36)
}
