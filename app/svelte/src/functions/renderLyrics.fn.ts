export default function (lyrics: string | null, lyricsContainerElement: HTMLElement) {
	if (lyrics === null) {
		lyrics = ''
	}

	lyricsContainerElement.innerHTML = ''

	let lyricsLines = lyrics.split('\n')

	lyricsLines.forEach((line, index) => {
		let lineElement: HTMLElement

		if (line === '') {
			lineElement = document.createElement('br')
		} else {
			lineElement = document.createElement('p')

			lineElement.style.opacity = '0'
			lineElement.style.transform = 'translateX(50%)'

			lineElement.innerHTML = line
		}

		lyricsContainerElement.appendChild(lineElement)

		setTimeout(() => {
			lineElement.style.opacity = '1'
			lineElement.style.transform = 'translateX(0%)'
		}, 25 * (index + 1))
	})
}
