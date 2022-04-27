export default function (event: Event, validPaths: string[]) {
	return event
		.composedPath() // Return back an array of all elements clicked.
		.map((path: HTMLElement) => path.tagName) // Gives only the tag name of the elements.
		.find(tag => validPaths.includes(tag)) // If the tag name matches the array of valid values.
}
