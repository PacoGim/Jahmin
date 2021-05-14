export function renameObjectKey(object: any, originalKey: string, newKey: string) {
	if (object[originalKey]) {
		object[newKey] = object[originalKey]
		delete object[originalKey]
	} else {
		console.log(`Orignal Key "${originalKey}" not found in object.`)
	}
}
