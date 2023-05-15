import type { PartialSongType } from '../../../types/song.type'

export default function (song: PartialSongType) {
	if ('mediaSession' in navigator) {
		if (navigator.mediaSession.metadata === null) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: '',
				artist: '',
				album: '',
				artwork: []
			})
		}

		navigator.mediaSession.metadata.title = song.Title
		navigator.mediaSession.metadata.artist = song.Artist
		navigator.mediaSession.metadata.album = song.Album

		setTimeout(() => {
			let fooElement = document.querySelector('control-bar-svlt album-art art-svlt img')?.getAttribute('src') || ''

			if (fooElement !== '') {
				fetch(fooElement).then(data => {
					data.blob().then(blob => {
						navigator.mediaSession.metadata.artwork = [
							{
								src: URL.createObjectURL(blob),
								sizes: '96x96',
								type: 'image/webp'
							}
						]
					})
				})
			}
		}, 250)
	}
}
