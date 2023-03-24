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
	language:string
	theme: ThemeOptions
	equalizerName?: string
	songAmount: number
	gridGap: number
	artSize: number
	contrastRatio: number
	fontSize: number
	sortBy: string
	sortOrder: 'asc' | 'desc'
	pauseAnimatedArtWhenAppUnfocused: boolean
	lyricsTextAlign: 'left' | 'center' | 'right'
	lyricsTextSize: number
	lyricsTextWeight: number
	alwaysShowAlbumOverlay: boolean
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

export type PartialConfigType<T> = {
	[P in keyof T]?: PartialConfigType<T[P]>;
}
