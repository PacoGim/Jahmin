import { FSWatcher, watch } from 'chokidar'
import isAudioFileFn from '../functions/isAudioFile.fn'
import { addToTaskQueue } from './librarySongs.service'

let watcher: FSWatcher | undefined
let foundPaths: string[] = []

let ignoredPaths: string[] = []

export function startChokidarWatch(rootDirectories: string[], excludeDirectories: string[] = []) {
	if (watcher) {
		watcher.close()
		watcher = undefined
	}

	watcher = watch(rootDirectories, {
		awaitWriteFinish: true,
		ignored: '**/*.DS_Store'
	})

	watcher.unwatch(excludeDirectories)

	watcher.on('add', (path: string) => {
		if (ignoredPaths.indexOf(path) !== -1) return

		if (isAudioFileFn(path)) {
			foundPaths.push(path)
		}
	})

	watcher.on('ready', () => {
		watcher!.on('all', (eventName, path) => {
			if (ignoredPaths.indexOf(path) !== -1) return

			if (!isAudioFileFn(path)) return

			if (eventName === 'change' && ignoredPaths.indexOf(path) === -1) {
				console.log(eventName, path)
				addToTaskQueue(path, 'external-update')
			} else {
				watchPaths([path])
			}

			if (eventName === 'unlink') addToTaskQueue(path, 'delete')
			if (eventName === 'add') addToTaskQueue(path, 'insert')
		})
	})
}

export function getRootDirFolderWatcher() {
	return watcher
}

export function unwatchPaths(paths: string[]) {
	paths.forEach(path => {
		if (ignoredPaths.indexOf(path) === -1) {
			ignoredPaths.push(path)
		}
	})

	console.log('Unwatch Paths', ignoredPaths)
}

export function watchPaths(paths: string[]) {
	paths.forEach(path => {
		if (ignoredPaths.indexOf(path) !== -1) {
			ignoredPaths.splice(ignoredPaths.indexOf(path), 1)
		}
	})

	console.log('Watch Paths', ignoredPaths)
}
