import * as fs from 'fs'
import * as path from 'path'

export default function (directories: string[] = [], extensionsToKeep: string[]) {
	const filePaths = directories.flatMap(folder => findFiles(folder, extensionsToKeep))

	return filePaths
}

function findFiles(directory: string, extensionsToKeep: string[], filePaths: string[] = []) {
	const files = fs.readdirSync(directory)

	files.forEach(file => {
		const filePath = path.join(directory, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory()) {
			findFiles(filePath, extensionsToKeep, filePaths)
		} else if (extensionsToKeep.includes(path.extname(file).slice(1))) {
			filePaths.push(filePath)
		}
	})

	return filePaths
}
