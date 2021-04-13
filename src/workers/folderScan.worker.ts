import { parentPort } from 'worker_threads'
import { getAacTags } from '../formats/aac.format'
import { getFlacTags } from '../formats/flac.format'
import { getMp3Tags } from '../formats/mp3.format'
import { SongType } from '../types/song.type'

parentPort?.on('message', (path) => {
	getSongTags(path).then((data) => {
		parentPort?.postMessage(data)
	})
})

function getSongTags(path: string): Promise<SongType> {
	return new Promise((resolve, reject) => {
		let extension = path.split('.').pop() || undefined

		if (extension === 'm4a') {
			getAacTags(path).then((data) => resolve(data))
		} else if (extension === 'flac') {
			getFlacTags(path).then((data) => resolve(data))
		} else if (extension === 'mp3') {
			getMp3Tags(path).then((data) => resolve(data))
		}
	})
}
