export type SongType = {
	[index: string]: string | number | undefined | null | boolean
	ID: number
	Directory: string
	PlayCount?: number | null
	Album?: string | null // Modifiable
	AlbumArtist?: string | null // Modifiable
	Artist?: string | null // Modifiable
	Composer?: string | null // Modifiable
	Genre?: string | null // Modifiable
	Title?: string | null // Modifiable
	Track?: number | null // Modifiable
	Rating?: number | null // Modifiable
	Comment?: string | null // Modifiable
	DiscNumber?: number | null // Modifiable
	DateYear?: number | null // Modifiable
	DateMonth?: number | null // Modifiable
	DateDay?: number | null // Modifiable
	SourceFile: string
	Extension?: string
	Size?: number
	Duration?: number | null
	SampleRate?: number | null
	LastModified?: number
	BitRate?: number | null
	BitDepth?: number | null
	IsEnabled?: 0 | 1 | null
}

export type PartialSongType = Partial<SongType>

export type SongFuzzySearchType = {
	item: SongType
}
