export type EqualizerProfileType = {
	name: string
	values: EqualizerProfileValuesType
	hash?: string
}

export type EqualizerProfileValuesType = {
	[key: string]: number
}
