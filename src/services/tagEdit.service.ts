import { getTagEditWorker } from './worker.service'

const worker = getTagEditWorker()

export function tagEdit(songList: string[], newTags: object) {
	songList.forEach((sourceFile) => worker.postMessage({ work: 'TagEdit', parameter: { sourceFile, newTags } }))
}
