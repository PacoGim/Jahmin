import Store from 'electron-store'

import path from 'path'
import fs from 'fs'

import { parentPort } from 'worker_threads'
import { hash } from '../functions/hashString.fn'
import { TagType } from '../types/tag.type'

let storagePath: string | undefined = undefined

type MessageType = {
	type: 'Add' | 'Delete' | 'Update' | 'Read'
	data: any
	appDataPath: 'string'
}

parentPort?.on('message', ({ type, data, appDataPath }: MessageType) => {
	if (storagePath === undefined) storagePath = path.join(appDataPath, 'storage')

	if (type === 'Add') add(data)
})

function add(data: TagType) {
	let rootFolder = data.SourceFile?.split('/').slice(0, -1).join('/')
	let rootFolderId = hash(rootFolder!, 'text') as string
	let songId = String(hash(data.SourceFile!, 'number'))

	const store = new Store({
		cwd: storagePath,
		name: rootFolderId
	})

	store.set(songId, data)
	updateStorageVersion()
}

function updateStorageVersion() {
	if (storagePath) {
		fs.writeFileSync(path.join(storagePath, 'version'), String(new Date().getTime()))
	}
}
