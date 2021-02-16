import loki from 'lokijs'

import { TagType } from '../types/tag.type'

//@ts-expect-error
import lfsa from 'lokijs/src/loki-fs-structured-adapter'
import path from 'path'
import fs from 'fs'
import deepmerge from 'deepmerge'

import { appDataPath } from '../index'

const ADAPTER = new lfsa()

let db: loki

let dbVersion = 0

const COLLECTION_NAME = 'music'

// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve: any = undefined

export function getNewPromiseDbVersion(rendererDbVersion: number): Promise<number> {
	// If the db version changed while going back and forth Main <-> Renderer
	if (dbVersion > rendererDbVersion) {
		return new Promise((resolve) => resolve(dbVersion))
	} else {
		// If didn't change, when for a change to happen.
		return new Promise((resolve) => (dbVersionResolve = resolve))
	}
}

export function loadDb(): Promise<void> {
	return new Promise((resolve) => {
		const DB_PATH = path.join(appDataPath, '/db')

		if (!fs.existsSync(DB_PATH)) {
			fs.mkdirSync(DB_PATH, { recursive: true })
			fs.writeFile(
				path.join(DB_PATH, 'DO_NOT_EDIT_FILES.txt'),
				'If you did then delete this folder content and re-scan folders.',
				() => {}
			)
		}

		db = new loki(path.join(DB_PATH, 'jahmin.db'), {
			adapter: ADAPTER,
			autoload: true,
			autoloadCallback: () => {
				databaseInitialize().then(() => resolve())
			},
			autosave: true,
			autosaveInterval: 10000
		})
	})
}

export function setDbVersion(newDbVersion: number) {
	dbVersion = newDbVersion
}

export function getDbVersion() {
	return dbVersion
}

export function getCollection() {
	const COLLECTION = db.getCollection(COLLECTION_NAME).find()
	return COLLECTION
}

export function createData(newDoc: TagType) {
	return new Promise((resolve, reject) => {
		try {
			// console.log('New Doc: ', newDoc)
			const COLLECTION = db.getCollection(COLLECTION_NAME)

			if (!COLLECTION) throw new Error(`Collection ${COLLECTION_NAME} not created/available.`)

			let oldDoc = readData({ SourceFile: newDoc['SourceFile'] })

			if (oldDoc) {
				resolve(updateData({ $loki: oldDoc['$loki'] }, newDoc))
			} else {
				resolve(COLLECTION.insert(newDoc))
				dbVersionResolve(++dbVersion)
			}
		} catch (error) {
			handleErrors(error)
			resolve(null)
		}
	})
}

export function readDataById(id: any) {
	try {
		const COLLECTION = db.getCollection(COLLECTION_NAME)

		if (!COLLECTION) throw new Error(`Collection ${COLLECTION_NAME} not created/available.`)

		return COLLECTION.get(id)
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function readData(query: any) {
	try {
		const COLLECTION: Collection<TagType> = db.getCollection(COLLECTION_NAME)

		if (!COLLECTION) throw new Error(`Collection ${COLLECTION_NAME} not created/available.`)

		return COLLECTION.find(query)[0]
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function updateData(query: any, newData: object) {
	return new Promise((resolve, reject) => {
		try {
			const COLLECTION = db.getCollection(COLLECTION_NAME)

			if (!COLLECTION) throw new Error(`Collection ${COLLECTION_NAME} not created/available.`)

			let doc = COLLECTION.find(query)[0]

			doc = deepmerge(doc, newData)

			resolve(COLLECTION.update(doc))
			dbVersionResolve(++dbVersion)
		} catch (error) {
			handleErrors(error)
			return null
		}
	})
}

export function deleteData(query: any) {
	return new Promise((resolve, reject) => {
		// console.log(query)

		const COLLECTION = db.getCollection(COLLECTION_NAME)

		if (!COLLECTION) throw new Error(`Collection ${COLLECTION_NAME} not created/available.`)

		const DOC = COLLECTION.find(query)[0]

		resolve(COLLECTION.remove(DOC))
		dbVersionResolve(++dbVersion)
	})
}

function handleErrors(error: Error | string) {
	error = String(error)
	if (error.includes('Duplicate key')) {
		// console.log(error)
	} else {
		console.log(error)
	}
}

function databaseInitialize(): Promise<void> {
	return new Promise((resolve) => {
		if (!db) return

		let collection = db.getCollection(COLLECTION_NAME)

		if (!collection) {
			db.addCollection(COLLECTION_NAME, {
				unique: ['SourceFile']
			})
		}
		resolve()
	})
}
