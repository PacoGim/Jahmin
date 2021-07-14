import Store from 'electron-store'

import path from 'path'
import fs from 'fs'

import { parentPort } from 'worker_threads'
import { hash } from '../functions/hashString.fn'
import { TagType } from '../types/tag.type'

let storagePath: string | undefined = undefined

let workQueue: WorkType[] = []
let isWorkQueueuIterating = false

type WorkType = {
	type: 'insert' | 'delete' | 'update' | 'read'
	data: any
	appDataPath?: 'string'
}

parentPort?.on('message', ({ type, data, appDataPath }: WorkType) => {
	if (appDataPath && storagePath === undefined) storagePath = path.join(appDataPath, 'storage')

	if (type === 'insert' || type === 'delete' || type === 'update') {
		workQueue.push({
			type,
			data
		})

		if (!isWorkQueueuIterating) {
			isWorkQueueuIterating = true
			iterateWorkQueue()
		}
	}
})

function iterateWorkQueue() {
	let work = workQueue.shift()

	if (work) {
		if (['insert', 'update'].includes(work.type)) {
			// console.log(work)
			insert(work.data).then(() => {
				// Tell to storage service to insert to song map
				parentPort?.postMessage({
					type: work?.type,
					data: work?.data
				})

				iterateWorkQueue()
			})
		} else if (['delete'].includes(work.type)) {
			deleteData(work.data).then(() => {
				parentPort?.postMessage({
					type: work?.type,
					data: work?.data
				})

				iterateWorkQueue()
			})
		}
	} else {
		isWorkQueueuIterating = false
	}
}

let storesMap = new Map<String, Store<Record<string, unknown>>>()

function deleteData(path: string) {
	return new Promise((resolve, reject) => {
		let rootFolder = path?.split('/').slice(0, -1).join('/')
		let rootFolderId = hash(rootFolder!, 'text') as string
		let songId = String(hash(path, 'number'))

		let store = storesMap.get(rootFolderId)

		if (store) {
			store.delete(songId)
		}

		updateStorageVersion()
		resolve('')
	})
}

function insert(data: TagType) {
	return new Promise((resolve, reject) => {
		let rootFolder = data.SourceFile?.split('/').slice(0, -1).join('/')

		if (rootFolder === undefined) {
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log(rootFolder)
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			console.log('!!!!!!!!!!!!!! NO ROOT FOLDER !!!!!!!!!!!!!!!!')
			return resolve('')
		}

		let rootFolderId = hash(rootFolder, 'text') as string
		let songId = String(hash(data.SourceFile!, 'number'))

		let store = storesMap.get(rootFolderId)

		if (!store) {
			let storeConfig: { name: string; cwd?: string } = {
				name: rootFolderId
			}

			if (storagePath) storeConfig.cwd = storagePath

			store = new Store(storeConfig)
			storesMap.set(rootFolderId, store)
		}

		store.set(songId, data)
		updateStorageVersion()
		resolve('')
	})
}

function updateStorageVersion() {
	if (storagePath) {
		fs.writeFileSync(path.join(storagePath, 'version'), String(new Date().getTime()))
	}
}
