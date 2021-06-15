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
	type: 'Add' | 'Delete' | 'Update' | 'Read'
	data: any
	appDataPath?: 'string'
}

parentPort?.on('message', ({ type, data, appDataPath }: WorkType) => {
	if (appDataPath && storagePath === undefined) storagePath = path.join(appDataPath, 'storage')

	if (type === 'Add' || type === 'Delete' || type === 'Update') {
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
		if (work.type === 'Add') {
			add(work.data).then(() => {
				// Tell to storage service to add to song map
				parentPort?.postMessage({
					type: work?.type,
					data: work?.data
				})

				iterateWorkQueue()
			})

			// process.nextTick(() => iterateWorkQueue())
		} else if (work.type === 'Update') {
			update(work.data).then(() => {
				// Tell to storage service to update son map
				parentPort?.postMessage({
					type: work?.type,
					data: work?.data
				})

				iterateWorkQueue()
			})

			// process.nextTick(() => iterateWorkQueue())
		}
	} else {
		isWorkQueueuIterating = false
	}
}

function update(data: TagType) {
	return new Promise((resolve, reject) => {
		// TODO Update Logic
	})
}

let storesMap = new Map<String, Store<Record<string, unknown>>>()

function add(data: TagType) {
	return new Promise((resolve, reject) => {
		let rootFolder = data.SourceFile?.split('/').slice(0, -1).join('/')
		let rootFolderId = hash(rootFolder!, 'text') as string
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
