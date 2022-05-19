export type SelectedTagType = {
	value: SelectedTagNameType
	isExpanded: boolean
	align: 'left' | 'center' | 'right'
}

export type SelectedTagNameType =
	| 'Extension'
	| 'Album'
	| 'AlbumArtist'
	| 'Artist'
	| 'Comment'
	| 'Composer'
	| 'Date_Year'
	| 'Date_Month'
	| 'Date_Day'
	| 'DiscNumber'
	| 'Genre'
	| 'Rating'
	| 'Title'
	| 'Track'
	| 'BitRate'
	| 'Duration'
	| 'SampleRate'
	| 'Size'
	| 'PlayCount'
