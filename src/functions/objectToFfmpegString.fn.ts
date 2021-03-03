import { SongType } from "../types/song.type"

export function objectToFfmpegString(tags: SongType) {
	let finalString = ''

	for (let key in tags) {
		finalString += ` -metadata "${key}=${tags[key]}" `
	}

	return finalString
}