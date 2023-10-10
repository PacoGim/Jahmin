import { SongType } from '../../types/song.type'
import { getDb } from './initDB.fn'
import { selectByIds } from './bulkRead.fn'
import { updateVersion } from './dbVersion.fn'
import { statSync } from 'fs'

export default function (songs: SongType[]) {
	return new Promise(async (resolve, reject) => {
		let ids = songs.map(song => song.ID)

		let foundSongs = (await selectByIds(ids)) || []

		if (foundSongs !== null && foundSongs.length > 0) {
			let foundIds = foundSongs.map(row => row.ID)

			songs = songs.filter(doc => {
				let currentFileModifiedTime = statSync(doc.SourceFile).mtimeMs
				let dbSong = foundSongs.find(item => item.ID === doc.ID)
				let dbFileModifiedTime = dbSong?.LastModified ? dbSong.LastModified : Infinity

				if (currentFileModifiedTime > dbFileModifiedTime) {
					return true
				} else if (foundIds.includes(doc.ID)) {
					return false
				} else {
					return true
				}
			})
		}

		if (songs.length === 0) {
			resolve(songs)
			return
		}

		const stmt = getDb().prepare(`INSERT OR REPLACE INTO songs (
      ID, PlayCount, Album, AlbumArtist, Artist, Composer, Genre, Title, Track, Rating, Comment, DiscNumber, DateYear, DateMonth, DateDay, SourceFile, Extension, Size, Duration, SampleRate, LastModified, BitRate, BitDepth, Directory, IsEnabled
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

		for (const row of songs) {
			stmt.run(
				row.ID,
				row.PlayCount,
				row.Album,
				row.AlbumArtist,
				row.Artist,
				row.Composer,
				row.Genre,
				row.Title,
				row.Track,
				row.Rating,
				row.Comment,
				row.DiscNumber,
				row.DateYear,
				row.DateMonth,
				row.DateDay,
				row.SourceFile,
				row.Extension,
				row.Size,
				row.Duration,
				row.SampleRate,
				row.LastModified,
				row.BitRate,
				row.BitDepth,
				row.Directory,
				null //IsEnabled
			)
		}

		stmt.finalize(() => {
			updateVersion()
			resolve(songs)
		})

		stmt.addListener('error', err => {
			console.log(err)
		})
	})
}
