export default function (filePath: string): string | undefined {
	let filePathSplit = filePath.split('.')
	if (filePathSplit && filePathSplit.length > 1) {
		let extension = filePathSplit.pop()

		if (extension) {
			return extension.toLowerCase()
		}
	}
	return undefined
}
