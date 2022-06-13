export default function (path: string, excludedPaths: string[]) {
	let isExcluded = false

	for (let excludedPath of excludedPaths) {
		if (path.includes(excludedPath)) {
			isExcluded = true
			break
		}
	}

	return !isExcluded
}
