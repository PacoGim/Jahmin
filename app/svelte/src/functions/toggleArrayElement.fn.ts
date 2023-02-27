export default function (array, value) {
	let index = array.indexOf(value)

	let arrayCopy = [...array]

	if (index === -1) {
		arrayCopy.push(value)
	} else {
		arrayCopy.splice(index, 1)
	}

	return arrayCopy
}
