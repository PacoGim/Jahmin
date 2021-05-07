export type SongType = {
	[index: string]: string | number | undefined | null
	Album?: string // Modifiable
	AlbumArtist?: string // Modifiable
	Artist?: string // Modifiable
	Composer?: string // Modifiable
	Genre?: string // Modifiable
	Title?: string // Modifiable
	Track?: number | null // Modifiable
	Rating?: number // Modifiable
	Comment?: string // Modifiable
	DiscNumber?: number | null // Modifiable
	Date_Year?: number | null // Modifiable
	Date_Month?: number | null // Modifiable
	Date_Day?: number | null // Modifiable
	SourceFile?: string
	Extension?: string
	Size?: number
	Duration?: number
	SampleRate?: number
	LastModified?: number
	BitRate?: number
	BitDepth?: number
}
