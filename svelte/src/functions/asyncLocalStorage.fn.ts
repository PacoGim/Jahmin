import isArray from './isArray.fn'
import isJson from './isJson.fn'

export function getItemFromLocalStorage(key: string): Promise<string | number> {
	return new Promise((resolve, reject) => {
		const item = localStorage.getItem(key)
		if (item) {
			resolve(item)
		} else {
			resolve(null)
		}
	})
}

export function setItemToLocalStorage(key: string, value: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (isJson(value) || isArray(value)) {
			localStorage.setItem(key, JSON.stringify(value))
		} else {
			localStorage.setItem(key, String(value))
		}

		resolve()
	})
}
