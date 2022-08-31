export function addIntersectionObserver(element: HTMLElement, rootDir: string, artSize: number) {
	let artObserver: IntersectionObserver

	artObserver = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting === true) {
				window.ipc.compressAlbumArt(rootDir, artSize, false)

				// "Closes" the Art Observer to avoid unnecessary checks.
				artObserver.disconnect()
			}
		},
		{ root: document.querySelector('art-grid-svlt'), threshold: 0, rootMargin: '200% 0px 200% 0px' }
	)
	artObserver.observe(element)
}
