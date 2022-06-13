import { FSWatcher, watch } from 'chokidar'
import isAudioFileFn from '../functions/isAudioFile.fn'
import { addToTaskQueue } from './librarySongs.service'

let watcher: FSWatcher | undefined
let foundPaths: string[] = []

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
		if (isAudioFileFn(path)) {
			foundPaths.push(path)
		}
	})

	watcher.on('ready', () => {
		watcher!.on('all', (eventName, path) => {
			if (!isAudioFileFn(path)) return

			if (eventName === 'change') addToTaskQueue(path, 'external-update')
			if (eventName === 'unlink') addToTaskQueue(path, 'delete')
			if (eventName === 'add') addToTaskQueue(path, 'insert')
		})
	})
}

export function getRootDirFolderWatcher() {
	return watcher
}

export function unwatchPaths(paths: string[]) {
	if (watcher) {
		paths.forEach(path => watcher!.unwatch(path))
	}
}

export function watchPaths(paths: string[]) {
	if (watcher) {
		paths.forEach(path => watcher!.add(path))
	}
}