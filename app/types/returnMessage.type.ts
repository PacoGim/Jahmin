export type ReturnMessageType = {
	code: 'EX' | 'OK' | 'EXISTS' | 'NOT_FOUND'
	message?: string
}
