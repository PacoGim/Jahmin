import path from 'path'
import fs from 'fs'
import sanitize from 'sanitize-filename'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

import type { PromiseResolveType } from '../../types/promiseResolve.type'

let lyricsFolderPath = path.join(getAppDataPathFn(), 'lyrics')

function saveLyrics(
	lyrics: string,
	songTile: string | null | undefined,
	songArtist: string | null | undefined
): Promise<PromiseResolveType> {
	return new Promise(resolve => {
		if (songTile === null || songTile === undefined || songArtist === null || songArtist === undefined) {
			return resolve({
				code: -1,
				message: 'Song Title or Song Artist not defined.'
			})
		}

		let lyricsPath = getCleanFileName(`${songTile}.${songArtist}` + '.txt')

		let lyricsFullPath = path.join(lyricsFolderPath, lyricsPath)

		if (!fs.existsSync(lyricsFolderPath)) {
			fs.mkdirSync(lyricsFolderPath, { recursive: true })
		}

		fs.writeFile(lyricsFullPath, lyrics, err => {
			if (err) {
				resolve({
					code: -1,
					message: 'Could not write file'
				})
			} else {
				resolve({
					code: 0,
					message: 'Lyrics saved!',
					data: {
						songTile,
						songArtist
					}
				})
			}
		})
	})
}

function getCleanFileName(str: string) {
	return removeIllegalCharacters(sanitize(`${removeSpacesAndUppercaseFirst(str)}`))
}

function removeIllegalCharacters(str: string) {
	let illegalChars = /[<>:"\/\\|?*\x00-\x1F]/g
	return str.replace(illegalChars, '')
}

function removeSpacesAndUppercaseFirst(str: string) {
	return str
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')
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

function deleteLyrics(title: string, artist: string) {
	return new Promise((resolve, reject) => {
		let lyricsPath = sanitize(`${title})_(${artist}.txt`)
		let lyricsAbsolutePath = path.join(lyricsFolderPath, lyricsPath)

		if (fs.existsSync(lyricsAbsolutePath)) {
			fs.unlink(lyricsAbsolutePath, err => {
				if (err) {
					resolve({ isError: true, message: 'Error when deleting' })
				} else {
					resolve({
						isError: false,
						message: 'Deleted successfully',
						data: {
							title,
							artist
						}
					})
				}
			})
		} else {
			resolve({ isError: true, message: 'Lyrics not found' })
		}
	})
}

export { saveLyrics, getLyrics, getLyricsList, deleteLyrics }
