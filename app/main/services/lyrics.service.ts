import path from 'path'
import fs from 'fs'
import sanitize from 'sanitize-filename'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

import type { PromiseResolveType } from '../../types/promiseResolve.type'

let lyricsFolderPath = path.join(getAppDataPathFn(), 'lyrics')

function saveLyrics(
	lyrics: string | 'SaveLyricsFromContextMenu',
	songTitle: string | null | undefined,
	songArtist: string | null | undefined
): Promise<PromiseResolveType> {
	return new Promise(resolve => {
		if (songTitle === null || songTitle === undefined || songArtist === null || songArtist === undefined) {
			return resolve({
				code: -1,
				message: 'Song Title or Song Artist not defined.'
			})
		}

		let lyricsPath = getCleanFileName(`${songTitle}.${songArtist}` + '.txt')

		let lyricsFullPath = path.join(lyricsFolderPath, lyricsPath)

		if (!fs.existsSync(lyricsFolderPath)) {
			fs.mkdirSync(lyricsFolderPath, { recursive: true })
		}

		if (lyrics === 'SaveLyricsFromContextMenu' && fs.existsSync(lyricsFullPath)) {
			return resolve({
				code: 0,
				message: 'Lyrics saved!',
				data: {
					title: songTitle,
					artist: songArtist
				}
			})
		} else {
			if (lyrics === 'SaveLyricsFromContextMenu') lyrics = ''

			lyrics = `Song Title: ${songTitle}\nSong Artist: ${songArtist}\n\n${lyrics}`

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
							title: songTitle,
							artist: songArtist
						}
					})
				}
			})
		}
	})
}

function getLyrics(songTitle: string, songArtist: string): Promise<PromiseResolveType> {
	return new Promise((resolve, reject) => {
		if (!songTitle || !songArtist) {
			return resolve({
				code: -1,
				message: 'Song Title or Song Artist not defined.'
			})
		}

		let lyricsPath = getCleanFileName(`${songTitle}.${songArtist}` + '.txt')

		let lyricsFullPath = path.join(lyricsFolderPath, lyricsPath)

		let lyricsFileContent = fs.readFileSync(lyricsFullPath, { encoding: 'utf8' })

		let songLyrics = lyricsFileContent.split('\n').slice(3).join('\n')

		if (songLyrics) {
			return resolve({
				code: 0,
				message: 'Lyrics found!',
				data: {
					title: songTitle,
					artist: songArtist,
					lyrics: songLyrics
				}
			})
		} else {
			return resolve({
				code: -1,
				message: 'Lyrics not found'
			})
		}
	})
}

function getLyricsList() {
	return new Promise((resolve, reject) => {
		let lyricFilesPathList = fs
			.readdirSync(lyricsFolderPath)
			.filter(file => file.endsWith('.txt'))
			.map(file => path.join(lyricsFolderPath, file))

		let lyricList = lyricFilesPathList.map(lyricFilePath => {
			let lyricsFileContent = fs.readFileSync(lyricFilePath, { encoding: 'utf8' })

			let lyricsSongTitle = lyricsFileContent.split('\n')[0].split('Song Title: ')[1].trim()
			let lyricsSongArtist = lyricsFileContent.split('\n')[1].split('Song Artist: ')[1].trim()
			// let lyricsSongLyrics = lyricsFileContent.split('\n').slice(3).join('\n')

			return {
				title: lyricsSongTitle,
				artist: lyricsSongArtist
			}
		})

		resolve(lyricList)
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
