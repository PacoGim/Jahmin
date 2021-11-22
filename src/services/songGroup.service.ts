import { SongType } from '../types/song.type'
import { sendWebContents } from './sendWebContents.service'
import { getStorageMapToArray } from './storage.service'

export function groupSongs(groups: string[], groupValues: string[]) {
	let songs = getStorageMapToArray()

	groups = normalizeGroupNames(groups)

	groups.forEach((group, index) => {
		runGroupSongs(songs, groups, groupValues, index)
	})
}

function runGroupSongs(songs: SongType[], groups: string[], groupValues: string[], index: number) {
	// console.log(groups, groupValues, index)
	// console.log(groups[index], groupValues[index], index)

	// songs = songs.slice(0, 10)

	/*
    Row 1 Since is the first row, we can just distinct Year since it is not based of the previous selected value.
    1999
    2000
    • 2001
    2002

    Row 2 Show songs with year 2001 and group extensions
    mp3 from 2001
    • flac from 2001
    opus from 2001

    Row 3
    Electronic flacs from 2001
    Rap flacs from 2001
    • Alternative flacs from 2001

    Send all songs/albums that match all previous selections.
    -> Songs from 2001, that are flac format, and have a genre of Alternative.
  */

	let groupedSongs: SongType[] = []

	if (index === 0) {
		sendWebContents('group-songs', {
			index,
			data: Array.from(new Set(songs.map(song => song[groups[index]])))
		})

		return
	}

	// groupedSongs=groupSongsByValue(songs: SongType[], groups: string[], groupValues: string[], index: number)

	// console.log(groups, groupValues)

	groupedSongs = groupSongsByValue(songs, groups, groupValues, index)

	// console.log(groupedSongs)

	let groupedValues: any[] = []

	groupedSongs.forEach(song => {
		let value = song[groups[index]]

		if (!groupedValues.includes(value)) {
			groupedValues.push(value)
		}
	})

	// console.log(groupedSongs)
	sendWebContents('group-songs', {
		index,
		// data: groupedSongs
		data: groupedValues
	})
}

function groupSongsByValue(songs: SongType[], groups: string[], groupValues: string[], index: number) {
	let groupedSongs: SongType[] = songs

	groups.forEach((group, groupIndex) => {
		if (groupIndex >= index) {
			return
		}

		groupedSongs = groupedSongs.filter(song => {
			if (groupValues[groupIndex] === undefined || groupValues[groupIndex] === 'undefined') {
				return true
			}

			if (song[group] === groupValues[groupIndex]) {
				return true
			} else {
				return false
			}
		})
	})

	return groupedSongs
}

function normalizeGroupNames(groups: string[]) {
	groups = groups.map(group => {
		switch (group) {
			case 'Album Artist':
				return 'AlbumArtist'
			default:
				return group
		}
	})

	return groups
}
