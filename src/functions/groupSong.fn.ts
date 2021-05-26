// import { getCollection } from '../services/loki.service.bak'
import { customAlphabet } from 'nanoid'
import { getStorageMapToArray } from '../services/storage.service'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)

// Gets the value to group by avery song with.
// For Example, Genre, Group every song with the same Genre.
export function groupSongs(valueToGroupBy: string) {
	let songs = getStorageMapToArray()

	let groups: any[] = []

	for (let song of songs) {
		let songValue = song[valueToGroupBy]

		if (!groups.includes(String(songValue))) {
			groups.push(songValue)
		}
	}

	return groups
		.map((i: string) => {
			return {
				id: nanoid(),
				name: i
			}
		})
		.sort((a, b) => String(a.name).localeCompare(String(b.name)))
}
