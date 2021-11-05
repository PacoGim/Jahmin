export function renameObjectKey(object: any, originalKey: string, newKey: string) {
	if (object[originalKey] !== undefined) {
		object[newKey] = object[originalKey]
		delete object[originalKey]
	}
}
