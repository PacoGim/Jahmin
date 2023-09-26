export type ConfigType = {
	bounds?: BoundsType
	directories: PartialDirectoriesType
	group?: PartialGroupType
	groupOnlyByFolder?: boolean
	songListTags?: SongListTagType[]
	userOptions: PartialUserOptionsType
}

type DirectoriesType = {
	add: string[]
	exclude: string[]
}

type SongListTagType = {
	width: number
	value: string
}

export type UserOptionsType = {
	language: string
	theme: ThemeOptions
	equalizerHash?: string
	songAmount: number
	gridGap: number
	artSize: number
	contrastRatio: number
	fontSize: number
	pauseAnimatedArtWhenAppUnfocused: boolean
	alwaysShowAlbumOverlay: boolean
	isFullscreen: boolean
	lyricsStyle: PartialLyricsStyleType
	showDynamicArtists: boolean
	showExtensionsIcons: boolean
	dateOrder: ('year' | 'month' | 'day' | '')[]
	songSort: {
		sortBy: string
		sortOrder: 'asc' | 'desc'
	}
	playback: PartialPlaybackOptionsType
}

export enum ThemeOptions {
	SystemBased = 'SystemBased',
	Night = 'Night',
	Day = 'Day'
}

type GroupType = {
	groupBy: string
	groupByValue: string
}

export type BoundsType = {
	x: number
	y: number
	height: number
	width: number
}

type LyricsStyleType = {
	fontWeight: number
	fontSize: number
	textAlignment: number
}

type PlaybackOptionsType = {
	shuffle: boolean
	repeatList: boolean
	repeatCurrent: boolean
}

type PartialUserOptionsType = Partial<UserOptionsType>
type PartialDirectoriesType = Partial<DirectoriesType>
type PartialGroupType = Partial<GroupType>
type PartialPlaybackOptionsType = Partial<PlaybackOptionsType>
type PartialLyricsStyleType = Partial<LyricsStyleType>

export type PartialConfigType = Partial<ConfigType>
