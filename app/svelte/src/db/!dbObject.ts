let db: any = undefined

export function setDB(newDb:any) {
	db = newDb
}

export function getDB() {
	return db
}
