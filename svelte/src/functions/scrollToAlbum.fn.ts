export default (rootDir: string, type: 'smooth-scroll' | 'not-smooth-scroll') => {
	const value = {
		'smooth-scroll': 'smooth',
		'not-smooth-scroll': undefined
	}[type]

	let albumElement = document.querySelector(`[rootDir="${rootDir}"]`)

	if (albumElement) {
		if (value === 'smooth') {
			albumElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
		} else if (value === undefined) {
			albumElement.scrollIntoView({ block: 'center', behavior: 'auto' })
		}
	}
}
