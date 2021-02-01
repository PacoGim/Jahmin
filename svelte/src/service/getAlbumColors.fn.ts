import { getAlbumColorsIPC } from './ipc.service'

export async function getAlbumColors(id: string) {
	// let albumImagePath: string = document.querySelector(`#${CSS.escape(id)}`).querySelector('img').getAttribute('src')

	// if (albumImagePath) {
		getAlbumColorsIPC(id).then((colors) => {
			document.documentElement.style.setProperty('--low-color', `#${colors['lowColor']}`)
			document.documentElement.style.setProperty('--mid-color', `#${colors['midColor']}`)
			document.documentElement.style.setProperty('--hi-color', `#${colors['hiColor']}`)
		})
	// }
}
