import Dexie, { Table } from 'dexie'

export interface Song {
	Album?: string | null
	AlbumArtist?: string | null
	Artist?: string | null
	Composer?: string | null
	Genre?: string | null
	Title?: string | null
	Track?: number | null
	Rating?: number | null
	Comment?: string | null
	DiscNumber?: number | null
	Date_Year?: number | null
	Date_Month?: number | null
	Date_Day?: number | null
	SourceFile: string | null
	Extension?: string | null
	Size?: number | null
	Duration?: number | null
	SampleRate?: number | null
	LastModified?: number
	BitRate?: number | null
	BitDepth?: number | null
}

export class MySubClassedDexie extends Dexie {
	songs!: Table<Song>

	constructor() {
		super('myDatabase')

		this.version(1).stores({
			songs: '++id,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
		})
	}
}

export const db = new MySubClassedDexie()
