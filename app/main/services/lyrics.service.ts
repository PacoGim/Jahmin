import path from 'path'
import fs from 'fs'
import sanitize from 'sanitize-filename'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

let lyricsFolderPath = path.join(getAppDataPathFn(), 'lyrics')

function saveLyrics(lyrics: string, songTile: string, songArtist: string, songDuration: number) {
	return new Promise((resolve, reject) => {
		songDuration = Math.trunc(songDuration)

		let lyricsPath = sanitize(`${songTile}-${songArtist}-${songDuration}.txt`)

		if (!fs.existsSync(lyricsFolderPath)) {
			fs.mkdirSync(lyricsFolderPath, { recursive: true })
		}

		fs.writeFile(path.join(lyricsFolderPath, lyricsPath), lyrics, err => {
			if (err) {
				reject(err)
			} else {
				resolve(`${songTile} lyrics saved!`)
			}
		})
	})
}

function getLyrics(songTile: string, songArtist: string, songDuration: number) {
	return new Promise((resolve, reject) => {
		songDuration = Math.trunc(songDuration)

		let lyricsPath = sanitize(`${songTile}-${songArtist}-${songDuration}.txt`)

		fs.readFile(path.join(lyricsFolderPath, lyricsPath), { encoding: 'utf8' }, (err, lyrics) => {
			if (err) {
				reject(err)
			} else {
				resolve(lyrics)
			}
		})
	})
}

export { saveLyrics, getLyrics }
