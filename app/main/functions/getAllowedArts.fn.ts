import fs from 'fs'
import path from 'path'

import getFileExtensionFn from '../functions/getFileExtension.fn'

import { allowedFiles, validFormats } from '../global/allowedArts.var'

// Returns all images sorted by priority.
export default function (rootDir: string) {
	try {
		let allowedArtFiles = fs
			.readdirSync(rootDir)
			.filter(file => allowedFiles.includes(file.toLowerCase()))
			.map(file => path.join(rootDir, file))
			.sort((a, b) => {
				// Gets the priority from the index of the valid formats above.
				// mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
				let aExtension = validFormats.indexOf(getFileExtensionFn(a))
				let bExtension = validFormats.indexOf(getFileExtensionFn(b))

				return aExtension - bExtension
			})

		return allowedArtFiles
	} catch (error) {
		return []
	}
}
