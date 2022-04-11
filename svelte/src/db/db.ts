import Dexie, { Table } from 'dexie'
import type { SongType } from '../types/song.type'

export class MySubClassedDexie extends Dexie {
	songs!: Table<SongType>

	constructor() {
		super('myDatabase')

		this.version(1).stores({
			songs:
				'++id,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})
	}
}

export const db = new MySubClassedDexie()

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
