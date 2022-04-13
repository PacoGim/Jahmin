import Dexie, { Table } from 'dexie'
import { dbVersion } from '../store/final.store'
import type { SongType } from '../types/song.type'

export class JahminDb extends Dexie {
	songs!: Table<SongType>

	constructor() {
		super('JahminDb')

		this.version(1).stores({
			songs:
				'++id,ID,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})
	}
}

export const db = new JahminDb()

export function addSong(song: SongType) {
	return new Promise(async (resolve, reject) => {
		let dbSong = await getSongById(song.ID)

		if (dbSong === undefined) {
			db.songs
				.add(song)
				.then(data => {
					dbVersion.set(Date.now())

					resolve(data)
				})
				.catch(err => {
					reject(err)
				})
		} else {
			// TODO: Update song
			// await db.update(song)
		}
	})
}

export function getSongById(songId: number): Promise<SongType> {
	return new Promise((resolve, reject) => {
		db.songs
			.where('ID')
			.equals(songId)
			.toArray()
			.then(song => {
				resolve(song[0])
			})
	})
}

export function getAllSongs(): Promise<SongType[]> {
	return new Promise(resolve => {
		db.songs.toArray().then(songs => {
			resolve(songs)
		})
	})
}

export function getAlbumSongs(rootDir: string): Promise<SongType[]> {
	return new Promise(resolve => {
		db.songs
			.where('SourceFile')
			.startsWithIgnoreCase(rootDir)
			.toArray()
			.then(songs => {
				resolve(songs)
			})
	})
}
