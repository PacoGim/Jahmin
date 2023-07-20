import * as fs from 'fs'
import * as path from 'path'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'

export default function (directories: string[] = []) {
	const audioFilePaths = directories.flatMap(folder => findAudioFiles(folder))

	return audioFilePaths
}

function findAudioFiles(directory: string, filePaths: string[] = []) {
	const files = fs.readdirSync(directory)

	files.forEach(file => {
		const filePath = path.join(directory, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory()) {
			findAudioFiles(filePath, filePaths)
		} else if (allowedSongExtensionsVar.includes(path.extname(file).slice(1))) {
			filePaths.push(filePath)
		}
	})

	return filePaths
}
