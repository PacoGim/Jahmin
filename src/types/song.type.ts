export type SongType = {
	[index: string]: string | number | undefined | null
	ID: number
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
	Date_Year?: number | null // Modifiable
	Date_Month?: number | null // Modifiable
	Date_Day?: number | null // Modifiable
	SourceFile: string
	Extension?: string
	Size?: number
	Duration?: number | null
	SampleRate?: number | null
	LastModified?: number
	BitRate?: number | null
	BitDepth?: number | null
}
