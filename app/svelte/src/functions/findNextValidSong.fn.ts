import type { SongType } from '../../../types/song.type'

export default function (currentSongIndex: number, songList: SongType[]): SongType | undefined {
	// Creates a copy of the playback array.
	let playbackArrayCopy = [...songList]

	// Cuts the array from the index to the end, to find the next enabled song beyond the current song in the playback.
	let cutArray = playbackArrayCopy.splice(currentSongIndex + 1)

	// Finds the first enabled song in the array.
	let nextSong = cutArray.find(song => song.IsEnabled !== 0)

	return nextSong
}
