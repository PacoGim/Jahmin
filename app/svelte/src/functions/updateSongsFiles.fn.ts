import { get } from 'svelte/store'
import type { SongType } from '../../../types/song.type'
import { altAudioPlayer, mainAudioPlayer } from '../stores/player.store'
import getElementDatasetFn from './getElementDataset.fn'
import { playingSongStore } from '../stores/main.store'
import deepmerge from 'deepmerge'

let songsToUpdateIds: number[] = []

export default function (songs: SongType[], newTags: Object) {
	console.log('-------------------')

	console.time('updateSongsFiles')
	// Give back the ID only if the song is playing or preloaded and it is present in the songs to update array.
	const mainSongId = songs.find(song => song.ID === Number(getElementDatasetFn(get(mainAudioPlayer))?.songId))?.ID
	const altSongId = songs.find(song => song.ID === Number(getElementDatasetFn(get(altAudioPlayer))?.songId))?.ID

	// Remove the songs that are playing or preloaded from the songs to update array.
	const songsToUpdate = songs.filter(song => song.ID !== mainSongId && song.ID !== altSongId)
	console.timeEnd('updateSongsFiles')

	// If the only songs to update are the ones that are playing or preloaded, return.
	if (songsToUpdate.length !== 0) {
		window.ipc.updateSongs(songsToUpdate, newTags)
	}

	// If the main player is playing or preloaded.
	if (mainSongId) {
		// Add the song id to an array of songs id to update.
		songsToUpdateIds.push(mainSongId)

		// Get the songs to update from LocalStorage.
		const localStorageSongsToUpdate = JSON.parse(localStorage.getItem('songsToUpdate') || '[]')

		// Get the index of the song to update in the LocalStorage array.
		const localStorageSongsToUpdateIndex = localStorageSongsToUpdate.findIndex((song: any) => song.songId === mainSongId)

		// If the song is already in the LocalStorage array, merge the new tags with the old ones.
		if (localStorageSongsToUpdateIndex !== -1) {
			localStorageSongsToUpdate[localStorageSongsToUpdateIndex].newTags = deepmerge(
				localStorageSongsToUpdate[localStorageSongsToUpdateIndex].newTags,
				newTags
			)
			// If the song is not in the LocalStorage array, add it.
		} else {
			localStorageSongsToUpdate.push({
				songId: mainSongId,
				newTags
			})
		}

		// Update the LocalStorage array.
		localStorage.setItem('songsToUpdate', JSON.stringify(localStorageSongsToUpdate))
	}

	if (altSongId) {
		songsToUpdateIds.push(altSongId)

		const localStorageSongsToUpdate = JSON.parse(localStorage.getItem('songsToUpdate') || '[]')
		const localStorageSongsToUpdateIndex = localStorageSongsToUpdate.findIndex((song: any) => song.songId === altSongId)

		if (localStorageSongsToUpdateIndex !== -1) {
			localStorageSongsToUpdate[localStorageSongsToUpdateIndex].newTags = deepmerge(
				localStorageSongsToUpdate[localStorageSongsToUpdateIndex].newTags,
				newTags
			)
		} else {
			localStorageSongsToUpdate.push({
				songId: altSongId,
				newTags
			})
		}

		// TODO Update front end
		localStorage.setItem('songsToUpdate', JSON.stringify(localStorageSongsToUpdate))
	}
	console.log('-------------------')
}

playingSongStore.subscribe(song => {
	console.log(songsToUpdateIds)
	console.log(song?.ID)

	// When the song changes, check if the id arrays has something.
	// If it has, check if the currently playing song is not in the array.
	// If it is not in the array, start sending an update event to the main process with each song in the songs array to update local storage.

	if (songsToUpdateIds.length) {
		// Filter the playing song id from the local storage songsToUpdate array.
		const localStorageSongsToUpdate = JSON.parse(localStorage.getItem('songsToUpdate') || '[]').filter((item: any) => {
			return item.songId !== song?.ID
		})

		if (localStorageSongsToUpdate.length !== 0) {
			localStorageSongsToUpdate.forEach((songToUpdate: SongType) => {
				// TODO Change the logic to get the song source file and not the id...
				window.ipc.updateSongs([songToUpdate.songId], songToUpdate.newTags)
			})
		}
	}
})
