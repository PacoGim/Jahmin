export type TagDetailType = {
	Album: string
	AlbumArtist: string
	Artist: string
	Comment: string
	Composer: string
	Date: DateType
	Genre: string
	Rating: number
	Title: string
	Track: number
	Year: number
}

type DateType = {
	year: number
	month: number
	day: number
}
