import type { PartialSongType, SongType } from '../../../types/song.type'

// Return selected songs data (from an array of IDs). If none are selected, then return all songs.
export function filterSongsToEdit(songList: SongType[], selectedSongs) {
	return selectedSongs.length !== 0 ? songList.filter(song => selectedSongs.includes(song.ID)) : songList
}

// Group tags by tag name. If a tag mismatches, it will be set to null. The purpose of this fn is to keep only the tag values that are common to all selected songs.
export function groupSongsByValues(songs: PartialSongType[]) {
	let groupedValues: any = {}

	for (let song of songs) {
		for (let tag in song) {
			// If groupedValues doesn't have this tag yet, add it.
			if (groupedValues[tag] === undefined) {
				groupedValues[tag] = song[tag]
			} else {
				// If groupedValues already has this tag, check if the next value is the same.
				if (groupedValues[tag] !== song[tag]) {
					groupedValues[tag] = null
				}
			}
		}
	}

	return groupedValues
}

export function getObjectDifference(obj1: any, obj2: any) {
	let diff = {}
	for (let key in obj1) {
		if (obj1[key] !== obj2[key]) {
			diff[key] = obj2[key]
		}
	}
	return diff
}
