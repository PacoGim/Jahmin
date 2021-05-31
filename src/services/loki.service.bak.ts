// import loki from 'lokijs'

// import { SongType } from '../types/song.type'

// import { LokiFsAdapter, LokiPartitioningAdapter } from 'lokijs'
// import path from 'path'
// import fs from 'fs'
// import deepmerge from 'deepmerge'

// import { appDataPath } from '../index'
// import { hash } from '../functions/hashString.fn'
// import { AlbumType } from '../types/album.type'

// const ADAPTER = new LokiPartitioningAdapter(new LokiFsAdapter(), { paging: true, pageSize: 1 * 1024 * 1024 })

// const DB_PATH = path.join(appDataPath(), '/db')

// let db: loki

// let songMap: Map<String, AlbumType> = new Map<String, AlbumType>()

// // Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
// let dbVersionResolve: any = undefined

// function getDBFileTimeStamp() {
// 	let filePath = path.join(DB_PATH, 'jahmin.db')

// 	if (fs.existsSync(filePath)) {
// 		return fs.statSync(filePath).mtimeMs
// 	} else {
// 		return 0
// 	}
// }

// export function getNewPromiseDbVersion(rendererDbVersion: number): Promise<number> {
// 	let dbFileTimeStamp = getDBFileTimeStamp()

// 	// If the db version changed while going back and forth Main <-> Renderer
// 	if (dbFileTimeStamp > rendererDbVersion) {
// 		return new Promise((resolve) => resolve(dbFileTimeStamp))
// 	} else {
// 		// If didn't change, wait for a change to happen.
// 		return new Promise((resolve) => (dbVersionResolve = resolve))
// 	}
// }

// export function loadDb(): Promise<void> {
// 	return new Promise((resolve) => {
// 		if (!fs.existsSync(DB_PATH)) {
// 			fs.mkdirSync(DB_PATH, { recursive: true })
// 			fs.writeFile(
// 				path.join(DB_PATH, 'DO_NOT_EDIT_FILES.txt'),
// 				'If you did then delete this folder content and re-scan folders.',
// 				() => {}
// 			)
// 		}

// 		db = new loki(path.join(DB_PATH, 'jahmin.db'), {
// 			adapter: ADAPTER,
// 			autoload: true,
// 			autoloadCallback: () => {
// 				databaseInitialize().then(() => {
// 					resolve()
// 					mapCollection()
// 				})
// 			},
// 			autosave: true,
// 			autosaveInterval: 2500,
// 			autosaveCallback: () => {
// 				console.log('Saving...')
// 				mapCollection()
// 				dbVersionResolve(getDBFileTimeStamp())
// 			}
// 		})
// 	})
// }

// export function getCollectionMap(): Map<String, AlbumType> {
// 	return songMap
// }

// function mapCollection() {
// 	const COLLECTION = db.getCollection('music').find()
// 	let map = new Map<String, AlbumType>()

// 	console.time()
// 	COLLECTION.forEach((song) => {
// 		let rootDir = song['SourceFile'].split('/').slice(0, -1).join('/')
// 		let rootId = hash(rootDir, 'text') as string

// 		let data = map.get(rootId)

// 		if (data) {
// 			if (!data.Songs.find((i) => i.ID === song.ID)) {
// 				data.Songs.push(song)

// 				map.set(rootId, data)
// 			}
// 		} else {
// 			map.set(rootId, {
// 				ID: rootId,
// 				RootDir: rootDir,
// 				Name: song.Album,
// 				Songs: [song]
// 			})
// 		}
// 	})

// 	songMap = map
// 	console.timeEnd()
// }

// export function getCollection() {
// 	const COLLECTION = db.getCollection('music').find()
// 	return COLLECTION
// }

// export function createData(newDoc: SongType) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			const COLLECTION = db.getCollection('music')

// 			if (!COLLECTION) throw new Error(`Collection music not created/available.`)

// 			let oldDoc = readData({ SourceFile: newDoc['SourceFile'] })

// 			if (oldDoc) {
// 				resolve(updateData({ $loki: oldDoc['$loki'] }, newDoc))
// 			} else {
// 				resolve(COLLECTION.insert(newDoc))
// 			}
// 		} catch (error) {
// 			handleErrors(error)
// 			resolve(null)
// 		}
// 	})
// }

// export function readDataById(id: any): SongType | null {
// 	try {
// 		const COLLECTION = db.getCollection('music')

// 		if (!COLLECTION) throw new Error(`Collection ${'music'} not created/available.`)

// 		return COLLECTION.get(id)
// 	} catch (error) {
// 		handleErrors(error)
// 		return null
// 	}
// }

// export function readData(query: any) {
// 	try {
// 		const COLLECTION: Collection<SongType> = db.getCollection('music')

// 		if (!COLLECTION) throw new Error(`Collection ${'music'} not created/available.`)

// 		return COLLECTION.find(query)[0]
// 	} catch (error) {
// 		handleErrors(error)
// 		return null
// 	}
// }

// export function updateData(query: any, newData: object) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			const COLLECTION = db.getCollection('music')

// 			if (!COLLECTION) throw new Error(`Collection ${'music'} not created/available.`)

// 			let doc = COLLECTION.find(query)[0]

// 			doc = deepmerge(doc, newData)

// 			resolve(COLLECTION.update(doc))
// 		} catch (error) {
// 			handleErrors(error)
// 			return null
// 		}
// 	})
// }

// export function deleteData(query: any) {
// 	return new Promise((resolve, reject) => {
// 		const COLLECTION = db.getCollection('music')

// 		if (!COLLECTION) throw new Error(`Collection ${'music'} not created/available.`)

// 		const DOC = COLLECTION.find(query)[0]

// 		resolve(COLLECTION.remove(DOC))
// 	}).catch(err=>console.log('Do not know'))
// }

// function handleErrors(error: Error | string) {
// 	error = String(error)
// 	if (error.includes('Duplicate key')) {
// 		// console.log(error)
// 	} else {
// 		console.log(error)
// 	}
// }

// function databaseInitialize(): Promise<void> {
// 	return new Promise((resolve) => {
// 		if (!db) return

// 		let collection = db.getCollection('music')

// 		if (!collection) {
// 			db.addCollection('music', {
// 				unique: ['SourceFile']
// 			})
// 		}
// 		resolve()
// 	})
// }
