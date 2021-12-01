export type ConfigType = {
	bounds?: BoundsType
	rootDirectories?: string[]
	group?: GroupType
	groupOnlyByFolder?: boolean
	songListTags?: any[]
	userOptions?: UserOptionsType
}

type UserOptionsType = {
	theme?: ThemeOptions
	equalizerId?: string
	songAmount?: number
	gridGap?: number
	artSize?: number
}

export enum ThemeOptions {
	Auto = 'Auto',
	Dark = 'Dark',
	Light = 'Light'
}

type GroupType = {
	groupBy: string[]
	groupByValues: string[]
}

type BoundsType = {
	x: number
	y: number
	height: number
	width: number
}
