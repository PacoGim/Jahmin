import type { SongType } from '../types/song.type'
import { updateSongIPC } from './ipc.service'

let songUpdateQueue = []
let isQueueRunning = false

export function addSongToUpdateToQueue(newTags: any, songstoUpdate: SongType[]) {
	songstoUpdate.forEach(song => {
		let songToUpdate = {
			song,
			newTags
		}

		let isAlreadyInQueue = songUpdateQueue.find(value => JSON.stringify(value) === JSON.stringify(songToUpdate))

		if (!isAlreadyInQueue) {
			songUpdateQueue.push(songToUpdate)

			if (isQueueRunning === false) {
				isQueueRunning = true
				runSongUpdateQueue()
			}
		}
	})
}

export function runSongUpdateQueue() {
	let songToUpdate = songUpdateQueue.shift()

	if (songToUpdate) {
		updateSongIPC(songToUpdate.song, songToUpdate.newTags)
	} else {
		isQueueRunning = false
	}
}
