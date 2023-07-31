import getAllFilesInFoldersDeepFn from '../functions/getAllFilesInFoldersDeep.fn'
import isAudioFileFn from '../functions/isAudioFile.fn'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'
import { addToTaskQueue } from '../services/librarySongs.service'

export default function (folderRoot: string) {
	let audioFiles = getAllFilesInFoldersDeepFn([folderRoot],allowedSongExtensionsVar)

	audioFiles.forEach(filePath => {
		addToTaskQueue(filePath, 'insert')
	})
}
