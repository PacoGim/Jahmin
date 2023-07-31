import path from 'path'
import fs from 'fs'

import getAppDataFn from './getAppDataPath.fn'
import getAllFilesInFoldersDeep from './getAllFilesInFoldersDeep.fn'

export default function () {
	return new Promise((resolve, reject) => {
		let artFolderPath = path.join(getAppDataFn(), 'arts')

		if (fs.existsSync(artFolderPath)) {
			let files = getAllFilesInFoldersDeep([artFolderPath], ['webp'])
			let sumSizes = 0

			files.forEach(filePath => {
				sumSizes += fs.statSync(filePath).size
			})

			resolve(getSizeUnit(sumSizes))
		} else {
			resolve('0 KB')
		}
	})
}

function getSizeUnit(size: number) {
	size = Number(size.toFixed(2))

	if (size < 1000) {
		return `${size} B`
	}

	size = Number((size / 1000).toFixed(2))

	if (size < 1000) {
		return `${size} KB`
	}

	size = Number((size / 1000).toFixed(2))

	if (size < 1000) {
		return `${size} MB`
	}

	size = Number((size / 1000).toFixed(2))

	if (size < 1000) {
		return `${size} GB`
	}
}
