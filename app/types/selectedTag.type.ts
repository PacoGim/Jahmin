export type SelectedTagType = {
	value: SelectedTagNameType
	isExpanded: boolean
	align: 'left' | 'center' | 'right'
}

export type SelectedTagNameType =
	| 'ChooseTag'
	| 'Extension'
	| 'Album'
	| 'AlbumArtist'
	| 'Artist'
	| 'Comment'
	| 'Composer'
	| 'DateYear'
	| 'DateMonth'
	| 'DateDay'
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