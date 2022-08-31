export default function (inObject: any) {
	let tempArray: any[] = []
	for (const key in inObject) {
		tempArray.push(inObject[key])
	}
	return tempArray
}
