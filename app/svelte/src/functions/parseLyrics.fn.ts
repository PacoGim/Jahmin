export default function (lyrics: string, lyricsContainerElement: HTMLElement) {
	lyricsContainerElement.innerHTML = ''

	let lyricsLines = lyrics.split('\n')

	lyricsLines.forEach(line => {
		let paragraphElement = document.createElement('p')

		paragraphElement.innerHTML = line

		lyricsContainerElement.appendChild(paragraphElement)
	})
}
