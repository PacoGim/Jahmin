import getAllFilesInFoldersDeepFn from '../functions/getAllFilesInFoldersDeep.fn'
import isAudioFileFn from '../functions/isAudioFile.fn'
import { addToTaskQueue } from '../services/librarySongs.service'

export default function (folderRoot: string) {
	let audioFiles = getAllFilesInFoldersDeepFn([folderRoot]).filter(file => isAudioFileFn(file))

	audioFiles.forEach(filePath => {
		addToTaskQueue(filePath, 'insert')
	})
}
