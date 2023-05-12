import nextSongFn from '../functions/nextSong.fn'
import previousSongFn from '../functions/previousSong.fn'

function nextMedia() {
	nextSongFn()
}

function previousMedia() {
	previousSongFn()
}

export default {
	nextMedia,
	previousMedia
}
