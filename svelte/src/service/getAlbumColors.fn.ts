import type { ColorType } from '../types/color.type'
import { getAlbumColorsIPC } from './ipc.service'

export async function getAlbumColors(id: string) {
	// let albumImagePath: string = document.querySelector(`#${CSS.escape(id)}`).querySelector('img').getAttribute('src')

	// if (albumImagePath) {
	getAlbumColorsIPC(id).then((color: ColorType) => {
		console.log(color)
		document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`)
		document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`)
		document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`)
	})
	// }
}
