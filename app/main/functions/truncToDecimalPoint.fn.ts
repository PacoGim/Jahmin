export default function (value: number | string, decimalPlace: number = 2): number {
	if (!isNaN(Number(value))) {
		value = String(value)
	} else {
		return 0
	}

	let splitValue = value.split('.')

	if (splitValue.length !== 2) {
		return Number(value)
	}

	return Number(`${splitValue[0]}.${splitValue[1].substring(0, decimalPlace)}`)
}
