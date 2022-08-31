
import getAllSongsFn from '../db/getAllSongs.fn'
import { hash } from '../functions/hashString.fn'
import { selectedGroups } from '../stores/main.store'
import type { SongType } from '../../../types/song.type'

export async function groupSongs(groups: string[], groupValues: string[]) {
	let songs = await getAllSongsFn()

	groups = normalizeGroupNames(groups)

	groups.forEach((group, index) => {
		runGroupSongs(songs, groups, groupValues, index)
	})
}

function runGroupSongs(songs: SongType[], groups: string[], groupValues: string[], index: number) {
	let filteredSongs: SongType[] = []
	let groupedValues: any[] = []

	/********************** First Index **********************/
	// For the first index there is no need to filter the songs.
	if (index === 0) {
		// Group songs by value.
		let firstIndexGroupedSongs = Array.from(new Set(songs.map(song => song[groups[index]])))

		// If too many values, slice the array to prevent performance issues.
		if (firstIndexGroupedSongs.length > 500) {
			firstIndexGroupedSongs = firstIndexGroupedSongs.slice(0, 500)

			// sendWebContents('notify', { type: 'error', message: `Only the first 500 ${groups[index]} will be shown.` })
		}

		// Sort array.
		firstIndexGroupedSongs = firstIndexGroupedSongs.sort((a, b) => {
			return String(a).localeCompare(String(b), undefined, { numeric: true })
		})

		let selectedGroupsLocal

		selectedGroups.subscribe(value => {
			selectedGroupsLocal = value
		})()

		selectedGroupsLocal[index] = firstIndexGroupedSongs
		selectedGroups.set(selectedGroupsLocal)

		return
	}

	/********************** Song Filtering **********************/
	// Filter out all songs by value.
	filteredSongs = filterSongsByValue(songs, groups, groupValues, index)

	// Group unique values.
	filteredSongs.forEach(song => {
		let value = song[groups[index]]

		if (!groupedValues.includes(value)) {
			groupedValues.push(value)
		}
	})

	// If too many values, slice the array to prevent performance issues.
	if (groupedValues.length > 500) {
		groupedValues = groupedValues.slice(0, 500)

		// sendWebContents('notify', { type: 'error', message: `Only the first 500 ${groups[index]} will be shown.` })
	}

	let selectedGroupsLocal

	selectedGroups.subscribe(value => {
		selectedGroupsLocal = value
	})()

	selectedGroupsLocal[index] = groupedValues.sort((a, b) => {
		if (a && b) {
			a = String(a).toLowerCase()
			b = String(b).toLowerCase()
			return a.localeCompare(b, undefined, { numeric: true })
		} else {
			return false
		}
	})
	selectedGroups.set(selectedGroupsLocal)

	/********************** Album Grouping **********************/

	// If last index, group unique albums.
	if (index === groups.length - 1) {
		// sendWebContents('albums-grouped', groupAlbums(filteredSongs, groups, groupValues, index))
	}
}

function groupAlbums(filteredSongs: SongType[], groups: string[], groupValues: string[], index: number) {
	let groupedAlbums: any[] = []

	// Keep all songs that match the last group value even if undefined.
	filteredSongs = filteredSongs.filter(song => {
		if (groupValues[index] === undefined || groupValues[index] === 'undefined') {
			return true
		}
		if (song[groups[index]] === groupValues[index]) {
			return true
		} else {
			return false
		}
	})

	// Group unique albums.
	filteredSongs.forEach(song => {
		let rootDir = song['SourceFile'].split('/').slice(0, -1).join('/')
		let foundAlbum = groupedAlbums.find(i => i['RootDir'] === rootDir)

		if (!foundAlbum) {
			groupedAlbums.push({
				ID: hash(rootDir),
				Name: song.Album,
				RootDir: rootDir,
				AlbumArtist: song.AlbumArtist,
				DynamicAlbumArtist: getAllAlbumArtists(groupedAlbums, song.Album),
				Songs: [song]
			})
		} else {
			foundAlbum['Songs'].push(song)
		}
	})

	return groupedAlbums
	// sendWebContents('albums-grouped', groupedAlbums)
}

// Iterates through every song of an album to get every single artist, then sorts them by the amount of songs done by artist, the more an artist has songs the firstest it will be in the array.
function getAllAlbumArtists(songArray: any[], album: string | undefined | null) {
	let artistsCount: any[] = []
	let artistsConcat: any[] = []
	let artistsSorted: string = ''

	songArray.forEach(song => {
		if (song['Album'] === album) {
			let artists = splitArtists(song['Artist'])

			if (artists.length > 0) {
				artistsConcat.push(...artists)
			} else {
				artistsConcat = artists
			}
		}
	})

	artistsConcat.forEach(artist => {
		let foundArtist = artistsCount.find(i => i['Artist'] === artist)

		if (foundArtist) {
			foundArtist['Count']++
		} else {
			artistsCount.push({
				Artist: artist,
				Count: 0
			})
		}
	})

	artistsCount = artistsCount.sort((a, b) => b['Count'] - a['Count'])
	artistsSorted = artistsCount.map(a => a['Artist']).join(', ')

	return artistsSorted
}

function splitArtists(artists: string) {
	if (artists) {
		let artistSplit: string[] = []

		if (typeof artists === 'string') {
			artistSplit = artists.split(', ')
			artistSplit = artists.split(',')
		}

		return artistSplit
	}
	return []
}

function filterSongsByValue(songs: SongType[], groups: string[], groupValues: string[], index: number) {
	let filteredSongs: SongType[] = songs

	groups.forEach((group, groupIndex) => {
		if (groupIndex >= index) {
			return
		}

		filteredSongs = filteredSongs.filter(song => {
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

	return filteredSongs
}

function normalizeGroupNames(groups: string[]) {

	if (!groups) {
		return groups
	}

	groups = groups.map(group => {
		switch (group) {
			case 'Album Artist':
				return 'AlbumArtist'
			case 'Disc #':
				return 'DiscNumber'
			case 'Year':
				return 'Date_Year'
			default:
				return group
		}
	})

	return groups
}
