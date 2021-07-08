export function generateId() {
	return BigInt(`${String(Math.random()).substring(2)}${Date.now()}`).toString(36)
}
