export default function (filePath: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		window.ipc.fileExists(filePath).then(result => {
			resolve(result)
		})
	})
}
