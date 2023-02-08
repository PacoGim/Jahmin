import type { Table } from "dexie"
import type { SongType } from "../../../types/song.type"
import type { JahminDb } from "./!db"

let db: any = undefined

export function setDB(newDb:any) {
	db = newDb
}

export function getDB():JahminDb {
	return db
}
