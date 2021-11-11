export default function isArray(value: any): boolean {
	return value && typeof value === 'object' && value.constructor === Array
}
