export default function (array: any[], key: string, sortOrder: string[]) {
	return array.sort((a, b) => sortOrder.indexOf(a[key]) - sortOrder.indexOf(b[key]))
}
