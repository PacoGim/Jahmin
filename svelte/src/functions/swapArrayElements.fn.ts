export default function (array: any[], indexA: number, indexB: number) {
	let temp = array[indexA]
	array[indexA] = array[indexB]
	array[indexB] = temp

	return array
}
