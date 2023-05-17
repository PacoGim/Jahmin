export type ConfigType = {
	bounds?: BoundsType
	directories: DirectoriesType
	group?: GroupType
	groupOnlyByFolder?: boolean
	songListTags?: any[]
	userOptions: UserOptionsType
}

type DirectoriesType = {
	add: string[]
	exclude: string[]
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
	sortBy: string
	sortOrder: 'asc' | 'desc'
	pauseAnimatedArtWhenAppUnfocused: boolean
	alwaysShowAlbumOverlay: boolean
	isFullscreen: boolean
	lyricsStyle: LyricsStyle
}

export enum ThemeOptions {
	SystemBased = 'SystemBased',
	Night = 'Night',
	Day = 'Day'
}

type GroupType = {
	groupBy: string[]
	groupByValues: string[]
}

export type BoundsType = {
	x: number
	y: number
	height: number
	width: number
}

type LyricsStyle = {
	fontWeight: number
	fontSize: number
	textAlignement: number
}

export type PartialConfigType = Partial<ConfigType>
