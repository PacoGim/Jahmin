import path from 'path'
import fs from 'fs'
import sanitize from 'sanitize-filename'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

let lyricsFolderPath = path.join(getAppDataPathFn(), 'lyrics')

function saveLyrics(lyrics: string | null, songTile: string | null | undefined, songArtist: string | null | undefined) {
	return new Promise((resolve, reject) => {
		if (songTile === null || songTile === undefined || songArtist === null || songArtist === undefined) {
			return reject('Song Title or Song Artist not defined.')
		}

		let lyricsPath = sanitize(`${songTile})_(${songArtist}.txt`)
		let lyricsFullPath = path.join(lyricsFolderPath, lyricsPath)

		if (!fs.existsSync(lyricsFolderPath)) {
			fs.mkdirSync(lyricsFolderPath, { recursive: true })
		}

		if (lyrics === null) {
			if (!fs.existsSync(lyricsFullPath)) {
				fs.writeFile(lyricsFullPath, '', err => {
					if (err) {
						reject(err)
					} else {
						resolve(`${songTile} lyrics saved!`)
					}
				})
			} else {
				resolve(`${songTile} lyrics saved!`)
			}
		} else {
			fs.writeFile(lyricsFullPath, lyrics, err => {
				if (err) {
					reject(err)
				} else {
					resolve(`${songTile} lyrics saved!`)
				}
			})
		}
	})
}

function getLyrics(songTile: string, songArtist: string) {
	return new Promise((resolve, reject) => {
		let lyricsPath = sanitize(`${songTile})_(${songArtist}.txt`)

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
			.filter(file => file.endsWith('.txt'))
			.map(file => file.split('.')[0])
			.map(file => {
				let fileSplit = file.split(')_(')
				return {
					title: fileSplit[0],
					artist: fileSplit[1]
				}
			})

		resolve(lyricsList)
	})
}

export { saveLyrics, getLyrics, getLyricsList }
