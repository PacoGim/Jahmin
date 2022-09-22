export default function (filePath: string | undefined): string | '' {
	if (filePath === undefined) return ''

	let filePathSplit = filePath.split('.')
	if (filePathSplit && filePathSplit.length > 1) {
		let extension = filePathSplit.pop()

		if (extension) {
			return extension.toLowerCase()
		}
	}
	return ''
}
