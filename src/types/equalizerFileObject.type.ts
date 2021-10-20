export type EqualizerFileObjectType = {
	id: string
	name?: string
	values: {
		frequency: number
		gain: number
	}[]
	filePath?:string
}