import loki from 'lokijs'

import { TagType } from '../types/tag.type'

//@ts-expect-error
import lfsa from 'lokijs/src/loki-fs-structured-adapter'
import path from 'path'
import fs from 'fs'
import deepmerge from 'deepmerge'

import { appDataPath } from '../index'

const adapter = new lfsa()

let db: loki

const collectionName = 'music'

export function loadDb(): Promise<void> {
	return new Promise((resolve) => {
		const dbPath = path.join(appDataPath, '/db')

		if (!fs.existsSync(dbPath)) {
			fs.mkdirSync(dbPath, { recursive: true })
			fs.writeFile(
				path.join(dbPath, 'DO_NOT_EDIT_FILES.txt'),
				'If you did then delete this folder content and re-scan folders.',
				() => {}
			)
		}

		db = new loki(path.join(dbPath, 'jahmin.db'), {
			adapter,
			autoload: true,
			autoloadCallback: () => {
				databaseInitialize().then(() => resolve())
			},
			autosave: true,
			autosaveInterval: 2000
		})
	})
}

export function getCollection() {
	const collection = db.getCollection(collectionName).find({ Genre: { $eq: 'Electronic' } })
	return collection
}

export function createData(newDoc: TagType) {
	try {
		const collection = db.getCollection(collectionName)

		if (!collection) throw new Error(`Collection ${collectionName} not created/available.`)

		let oldDoc = readData({ SourceFile: newDoc['SourceFile'] })

		if (oldDoc) {
			return updateData({ $loki: oldDoc['$loki'] }, newDoc)
		} else {
			return collection.insert(newDoc)
		}
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function readDataById(id: any) {
	try {
		const collection = db.getCollection(collectionName)

		if (!collection) throw new Error(`Collection ${collectionName} not created/available.`)

		return collection.get(id)
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function readData(query: any) {
	try {
		const collection: Collection<TagType> = db.getCollection(collectionName)

		if (!collection) throw new Error(`Collection ${collectionName} not created/available.`)

		return collection.find(query)[0]
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function updateData(query: any, newData: object) {
	try {
		const collection = db.getCollection(collectionName)

		if (!collection) throw new Error(`Collection ${collectionName} not created/available.`)

		let doc = collection.find(query)[0]

		doc = deepmerge(doc, newData)

		return collection.update(doc)
	} catch (error) {
		handleErrors(error)
		return null
	}
}

export function deleteData(query: any) {
	const collection = db.getCollection(collectionName)

	if (!collection) throw new Error(`Collection ${collectionName} not created/available.`)

	const doc = collection.find(query)[0]

	return collection.remove(doc)
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

		let collection = db.getCollection(collectionName)

		if (!collection) {
			db.addCollection(collectionName, {
				unique: ['SourceFile']
			})
		}
		resolve()
	})
}
