import { parentPort } from 'worker_threads'
import { ExifTool } from 'exiftool-vendored'
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

parentPort?.on('message', (data) => {
	// exiftool.read(filePath).then((metadata: any) => {
	// 	parentPort?.postMessage({ filePath, metadata })
	// })

	console.log(1)
	// exiftool
	// 	.write(data.filePath, data.newTags, ['-overwrite_original'])
	// 	.then(() => {
	// 		console.log(2)
	// 		parentPort?.postMessage({ filePath: data.filePath, status: 'Good' })
	// 	})
	// 	.catch((err) => {
	// 		console.log(3)
	// 		parentPort?.postMessage({ filePath: data.filePath, status: 'Bad' })
	// 	})
})
