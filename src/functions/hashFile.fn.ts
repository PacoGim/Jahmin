import fs from 'fs'
import spark from 'spark-md5'

export default function (filePath: string) {
	return new Promise((resolve, reject) => {
		let file = fs.readFileSync(filePath)

		let hash = spark.ArrayBuffer.hash(file)

		resolve(hash)
	})
}
