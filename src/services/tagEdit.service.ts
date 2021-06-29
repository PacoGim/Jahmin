import { writeOpusTags } from '../formats/opus.format'
import { getWorker } from './worker.service'

const worker = getWorker('tagEdit')

export function tagEdit(songList: string[], newTags: object) {
	songList.forEach((sourceFile) => worker?.postMessage({ message: 'TagEdit', parameter: { sourceFile, newTags } }))
}
