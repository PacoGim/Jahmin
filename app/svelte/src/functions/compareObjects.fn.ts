export default function (object1: Object, object2: Object) {
	let object1String = ''
	let object2String = ''

	try {
		object1String = JSON.stringify(object1)
	} catch (error) {
		object1String = ''
	}

	try {
		object2String = JSON.stringify(object2)
	} catch (error) {
		object2String = ''
	}

	if (object1String === object2String) {
		return true
	} else {
		return false
	}
}
