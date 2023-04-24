export type EqualizerFileObjectType = {
	name: string
	values: {
		[key: string]: number
	}|undefined
	hash?: string
	type?:'Local'|'Community'
}
