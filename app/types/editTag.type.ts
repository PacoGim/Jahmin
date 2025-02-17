export type EditTag = {
	[index: string]: string | number | undefined
	Album?: string
	AlbumArtist?: string
	Comment?: string
	Composer?: string
	Artist?: string
	DateDay?: number
	DateMonth?: number
	DateYear?: number
	DiscNumber?: number
	Genre?: string
	Rating?: number
	Title?: string
	Track?: number
	TDRC?: string // Not coming from renderer. Added for simplicity sake.
	popularimeter?: any // Not coming from renderer. Added for simplicity sake.
	comment?: any // Not coming from renderer. Added for simplicity sake.
	Date?: string // Not coming from renderer. Added for simplicity sake.
	ContentCreateDate?: string // Not coming from renderer. Added for simplicity sake.
	AllDates?: string // Not coming from renderer. Added for simplicity sake.
}
