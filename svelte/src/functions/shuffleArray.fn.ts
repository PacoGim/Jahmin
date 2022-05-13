export default function (inputArray: any[]) {
	let arrayCopy = [...inputArray].map(item => {
		return {
			randomValue: Math.random(),
			data: item
		}
	})

	arrayCopy.sort((a, b) => {
		return a.randomValue - b.randomValue
	})

	return arrayCopy.map(item => {
		return item.data
	})
}
