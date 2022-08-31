import { dbSongsStore } from '../stores/main.store'
import type { SongType } from '../../../types/song.type'
import { getDB } from './!dbObject'

export default function (): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		dbSongsStore.subscribe((songs:SongType[]) => {
			if (songs.length === 0) {
				getDB().songs.toArray().then((songs:SongType[]) => {
					resolve(songs)
				})
			} else {
				resolve(songs)
			}
		})()
	})
}
