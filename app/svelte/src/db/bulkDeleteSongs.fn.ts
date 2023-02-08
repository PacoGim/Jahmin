import { dbSongsStore } from '../stores/main.store'
import { getDB } from './!dbObject'
import updateVersionFn from './updateVersion.fn'

export default function (songsId: number[]) {
	return new Promise((resolve, reject) => {
		getDB()
			.songs.bulkDelete(songsId)
			.then(() => {
				getDB()
					.songs.count()
					.then(count => {
						if (count === 0) {
							dbSongsStore.set([])
						}

						updateVersionFn()
					})
			})
			.catch(err => {
				console.log(err)
			})
			.finally(() => {
				resolve(undefined)
			})
	})
}
