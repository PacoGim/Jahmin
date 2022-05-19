import isJson from './isJson.fn'

export default function (object1: object, object2: object) {
	if (object1 === undefined || object2 === undefined) {
		return false
	}

	if (isJson(object1) && isJson(object2)) {
		return JSON.stringify(object1) === JSON.stringify(object2)
	}

	return false
}
