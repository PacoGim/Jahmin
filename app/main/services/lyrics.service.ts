import path from 'path'
import fs from 'fs'
import sanitize from 'sanitize-filename'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

let lyricsFolderPath = path.join(getAppDataPathFn(), 'lyrics')

function saveLyrics(lyrics: string, songTile: string, songArtist: string) {
	return new Promise((resolve, reject) => {
		let lyricsPath = sanitize(`${songTile}-${songArtist}.txt`)

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

function getLyrics(songTile: string, songArtist: string) {
	return new Promise((resolve, reject) => {
		let lyricsPath = sanitize(`${songTile}-${songArtist}.txt`)

		fs.readFile(path.join(lyricsFolderPath, lyricsPath), { encoding: 'utf8' }, (err, lyrics) => {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve('')
				} else {
					reject(err)
				}
			} else {
				resolve(lyrics)
			}
		})
	})
}

function getLyricsList() {
	return new Promise((resolve, reject) => {
		let lyricsList = fs
			.readdirSync(lyricsFolderPath)
			.map(file => file.split('.')[0])
			.map(file => {
				let fileSplit = file.split('-')
				return {
					title: fileSplit[0],
					artist: fileSplit[1]
				}
			})

		resolve(lyricsList)
	})
}

export { saveLyrics, getLyrics, getLyricsList }
