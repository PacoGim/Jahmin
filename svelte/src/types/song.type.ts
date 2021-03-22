export type SongType = {
	[index: string]: string | number | undefined
	ID: number
	Album?: string // Modifiable
	AlbumArtist?: string // Modifiable
	Artist?: string // Modifiable
	Composer?: string // Modifiable
	Genre?: string // Modifiable
	Title?: string // Modifiable
	Track?: string // Modifiable
	Rating?: number // Modifiable
	Comment?: string // Modifiable
	DiscNumber?: number // Modifiable
	Date_Year: number | undefined // Modifiable
	Date_Month: number | undefined // Modifiable
	Date_Day: number | undefined // Modifiable
	SourceFile?: string
	Extension?: string
	Size?: number
	Duration?: number
	SampleRate?: number
	LastModified?: number
	BitRate?: string
	BitDepth?: number
}
