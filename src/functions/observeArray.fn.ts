export function observeArray(arr: { [index: string]: any }, toObserve: string[], callback: Function) {
	toObserve.forEach((m: string) => {
		arr[m] = function () {
			//@ts-ignore
			let res = Array.prototype[m].apply(arr, arguments)
			callback.apply(arr, arguments)
			return res
		}
	})
}
