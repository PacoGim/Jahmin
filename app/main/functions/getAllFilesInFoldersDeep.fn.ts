import * as fs from 'fs'
import * as path from 'path'

export default function getAllFilesInFoldersDeep(rootDirectory: string[]=[]) {
	let allFiles: string[] = []

	rootDirectory.forEach(rootDirectory => {
		let files = fs.readdirSync(rootDirectory)

		files.forEach(file => {
			let filePath = path.join(rootDirectory, file)

			if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
				allFiles = allFiles.concat(getAllFilesInFoldersDeep([filePath]))
			} else {
				allFiles.push(filePath)
			}
		})
	})

	return allFiles
}
