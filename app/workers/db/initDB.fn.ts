import path from 'path'
import { Database, sqlite3 } from 'sqlite3'
import fs from 'fs'
import createTableFn from './createTable.fn'

const sqlite3: sqlite3 = require('sqlite3').verbose()

let db: Database

export default function (appDataPath: string) {
	const dbPath = path.join(appDataPath, 'database')

	if (fs.existsSync(dbPath) === false) {
		fs.mkdirSync(dbPath)
	}

	// for (let i = 0; i < numShards; i++) {
	// let dbPathChunk = path.resolve(dbPath, `${i}.db`)
	let dbPathChunk = path.resolve(dbPath, `0.db`)

	db = new sqlite3.Database(dbPathChunk, err => {
		if (err) {
			console.error(err.message)
		}
	})

	createTableFn(db)
}

export function getDb() {
	return db
}
