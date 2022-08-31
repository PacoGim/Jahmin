import { getDB } from './!dbObject'
import updateVersionFn from './updateVersion.fn'

export default function (id: number) {
	getDB().songs
		.where('ID')
		.equals(id)
		.first()
		.then(song => {
			song.PlayCount = song.PlayCount !== undefined ? song.PlayCount + 1 : 1
			getDB().songs.put(song).then(() => updateVersionFn())
		})
}
