import { getCollection } from '../services/loki.service'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)

// Gets the value to group by avery song with.
// For Example, Genre, Group every song with the same Genre.
export function groupSongs(valueToGroupBy: string) {
	let songs = getCollection()

	let groups: string[] = []

	for (let song of songs) {
		let songValue = song[valueToGroupBy]

		if (!groups.includes(songValue)) {
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
