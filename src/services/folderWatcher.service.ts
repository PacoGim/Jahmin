import { FSWatcher, watch } from 'chokidar'
import path from 'path'
import fs from 'fs'
import { appDataPath } from '..'

let watcher: FSWatcher

export function getRootDirFolderWatcher() {
	return watcher
}

/* ▼▼▼ Folder Related Variables ▼▼▼ */
let folderIndexList: any[] = []
console.log(appDataPath)
let folderIndexPath = path.join(appDataPath, 'folderIndex.json')
let folderIndexData: []

let modifiedFolders: string[] = []

try {
	folderIndexData = JSON.parse(fs.readFileSync(folderIndexPath, { encoding: 'utf-8' }))
} catch (error) {
	folderIndexData = []
}
/* ▲▲▲ Folder Related Variables ▲▲▲ */

export function watchFolders(rootDirectories: string[]) {
	watcher = watch(rootDirectories, {
		awaitWriteFinish: true
	})

	// Detect modified folders. A folder is considered modified (mtimeMs changes) if a file has been added or removed.
	watcher.on('addDir', (path, stats) => preStartFolderChangeDetection(path, stats))

	watcher.on('ready', () => {
		fs.writeFileSync(folderIndexPath, JSON.stringify(folderIndexList), { encoding: 'utf-8' })

		console.log(modifiedFolders)

		console.log('ready')
	})
}

function preStartFolderChangeDetection(path: string, stats: any) {
	if (folderIndexData) {
		let foundDifferentIndexFolder = folderIndexData.find(
			(x: { path: string; lastModifiedTime: number }) => x.path === path && x.lastModifiedTime !== stats?.mtimeMs
		)

		if (foundDifferentIndexFolder) {
			modifiedFolders.push(path)
		}

		folderIndexList.push({
			path,
			lastModifiedTime: stats?.mtimeMs
		})
	}
}
