import sparkMd5 from 'spark-md5'
import { readFileSync } from 'fs'

export default function (filePath: string) {
	return new Promise((resolve, reject) => {
		let fileBuffer = readFileSync(filePath)

		let hash = sparkMd5.ArrayBuffer.hash(fileBuffer)

		resolve(hash)
	})
}
