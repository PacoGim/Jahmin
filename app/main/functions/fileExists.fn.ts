import fs from 'fs'

export default function (filePath: string): boolean {
	return fs.existsSync(filePath)
}
