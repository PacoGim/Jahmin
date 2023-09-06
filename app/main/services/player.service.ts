let title: string = ''
let artist: string = ''
let isPlaying: boolean = false

export function getTitle() {
	return title
}

export function setTitle(newTitle: string) {
	title = newTitle
}

export function getArtist() {
	return artist
}

export function setArtist(newArtist: string) {
	artist = newArtist
}

export function getIsPlaying() {
	return isPlaying
}

export function setIsPlaying(newIsPlaying: boolean) {
	isPlaying = newIsPlaying
}
