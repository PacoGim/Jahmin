export type EqualizerProfileType = {
	name: string
	values: EqualizerProfileValuesType
	hash?: string
	type?:'Local'|'Community'
}

export type EqualizerProfileValuesType = {
	[key: string]: number
}
