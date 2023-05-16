import nextSongFn from '../functions/nextSong.fn'
import previousSongFn from '../functions/previousSong.fn'
import togglePlayPause from '../functions/togglePlayPause'

function nextMedia() {
	nextSongFn()
}

function previousMedia() {
	previousSongFn()
}

function togglePlayPauseMedia() {
	togglePlayPause()
}

export default {
	nextMedia,
	previousMedia,
	togglePlayPauseMedia
}