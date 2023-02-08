import type { SongType } from '../../../types/song.type'
import { songListStore } from '../stores/main.store'
import { getDB } from './!dbObject'
import updateVersionFn from './updateVersion.fn'

export default function (id: number) {
	getDB()
		.songs.where('ID')
		.equals(id)
		.first()
		.then((song: SongType) => {
			song.PlayCount = song.PlayCount !== undefined ? song.PlayCount + 1 : 1

			getDB()
				.songs.put(song)
				.then(() => /*updateVersionFn()*/{})

			// Updates the song list to reflect the new play count changes.
			let songListStoreLocal: SongType[] = undefined

			songListStore.subscribe(value => (songListStoreLocal = value))()

			let songFound = songListStoreLocal.find(storeSong => storeSong.ID === song.ID)

			if (songFound) {
				songFound.PlayCount = song.PlayCount
				songListStore.set(songListStoreLocal)
			}
		})
}
