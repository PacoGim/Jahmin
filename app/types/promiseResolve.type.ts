export type PromiseResolveType = {
	code: 0 | -1 // 0: success, -1: error
	message: string
	data?: any
}
