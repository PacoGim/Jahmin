import { get } from 'svelte/store'
import type { SongType } from '../../../types/song.type'
import { playingSongStore } from '../stores/main.store'
import { altAudioPlayer, mainAudioPlayer } from '../stores/player.store'
import getElementDatasetFn from './getElementDataset.fn'

export default function (songs: SongType[], newTags: Object) {
	console.log('-------------------')

	console.time('updateSongsFiles')
	let mainSongId = getElementDatasetFn(get(mainAudioPlayer))?.songId
	let altSongId = getElementDatasetFn(get(altAudioPlayer))?.songId

	/*

      Is the song playing and in the array of songs to update?
      If it is, remove the song from the songs array.

      Do this bit AFTER sending the songs to update to the main process
      */

	console.timeEnd('updateSongsFiles')

	console.log('New song update')
	console.log(songs)
	console.log(newTags)
	console.log('-------------------')
	window.ipc.updateSongs(songs, newTags)

	/*

     Add the song id to an array of songs id to update.
     Add the song the playing/preloaded song to LocalStorage with the new tags to apply


  */
}
