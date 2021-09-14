export type SelectedTagType = {
	name: SelectedTagNameType

	size: 'Collapse' | 'Expand'
	align: 'Left' | 'Center' | 'Right'
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
