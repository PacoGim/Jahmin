export default function (value: string | number): boolean {
	if (typeof value === 'number') {
		return true
	}

	if (!isNaN(Number(value))) {
		return true
	}

	return false
}
