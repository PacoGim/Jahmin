export type TagType = {
	[index: string]: string | number | undefined
	Album?: string // Modifiable
	AlbumArtist?: string // Modifiable
	Artist?: string // Modifiable
	Composer?: string // Modifiable
	Date?: string // Modifiable
	Genre?: string // Modifiable
	Title?: string // Modifiable
	Track?: string // Modifiable
	Rating?: number // Modifiable
	Year?: number // Modifiable
	Comment?: string // Modifiable
	DiscNumber?: number // Modifiable
	SourceFile?: string
	Extension?: string
	Size?: number
	Duration?: number
	SampleRate?: number
	LastModified?: number
	BitRate?: number
	BitDepth?: number
}
