export function lowerCaseObjectKeys(objectToProcess: any) {
	let newObject: any = {}

	for (let key in objectToProcess) {
		newObject[key.toLowerCase()] = objectToProcess[key]
	}

	return newObject
}