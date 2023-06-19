import { MenuItemConstructorOptions } from 'electron'
import { deleteLyrics } from '../services/lyrics.service'
import sendWebContentsFn from '../functions/sendWebContents.fn'

type DataType = {
	lyricsTitle: string
	lyricsArtist: string
}

export default function (data: DataType) {
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Delete Lyrics`,
		click: () => {
			sendWebContentsFn('confirm-lyrics-deletion', {
				lyricsTitle: data.lyricsTitle,
				lyricsArtist: data.lyricsArtist
			})

			// deleteLyrics(data.lyricsTitle, data.lyricsArtist).then(response => {
			// sendWebContentsFn('lyrics-deleted', response)
			// })
		}
	})

	return template
}
