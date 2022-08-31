export default function (array: any[]) {
	return [...new Map(array.map(v => [JSON.stringify(v), v])).values()]
}
