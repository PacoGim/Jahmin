import { SongType } from '../../types/song.type'
import { getDb } from './initDB.fn'
import {selectByIds, selectByKeyValue} from './bulkRead.fn'
import { updateVersion } from './dbVersion.fn'

export default function (songs: SongType[]) {
	return new Promise(async (resolve, reject) => {
		let ids = songs.map(song => song.ID)

		let foundSongs = (await selectByIds(ids)) || []

		if (foundSongs !== null && foundSongs.length > 0) {
			let foundIds = foundSongs.map(row => row.ID)

			songs = songs.filter(doc => !foundIds.includes(doc.ID))
		}

		if (songs.length === 0) {
			resolve(songs)
			return
		}

		const stmt = getDb().prepare(`INSERT INTO songs (
      ID, PlayCount, Album, AlbumArtist, Artist, Composer, Genre, Title, Track, Rating, Comment, DiscNumber, Date_Year, Date_Month, Date_Day, SourceFile, Extension, Size, Duration, SampleRate, LastModified, BitRate, BitDepth
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

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
				row.Date_Year,
				row.Date_Month,
				row.Date_Day,
				row.SourceFile,
				row.Extension,
				row.Size,
				row.Duration,
				row.SampleRate,
				row.LastModified,
				row.BitRate,
				row.BitDepth
			)
		}

		stmt.finalize(() => {
			updateVersion()
			// console.log(songs.length)
			resolve(songs)
		})
	})
}
