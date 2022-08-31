import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'

function parse(data: string) {
	try {
		return JSON.parse(data)
	} catch (error) {
		return null
	}
}

function stringify(data: EqualizerFileObjectType) {
	return JSON.stringify(data, null, 2)
}

export default {
	parse,
	stringify
}
