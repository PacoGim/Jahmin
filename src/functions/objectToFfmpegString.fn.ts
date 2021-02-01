import { TagType } from "../types/tag.type"

export function objectToFfmpegString(tags: TagType) {
	let finalString = ''

	for (let key in tags) {
		finalString += ` -metadata "${key}=${tags[key]}" `
	}

	return finalString
}