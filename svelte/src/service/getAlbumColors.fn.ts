import type { ColorType } from '../types/color.type'
import { getAlbumColorsIPC } from './ipc.service'

export async function getAlbumColors(albumId: string): Promise<ColorType> {
	return new Promise((resolve, reject) => {
		getAlbumColorsIPC(albumId).then((color: ColorType) => {
			if (color === undefined) {
				color = {
					hue: 0,
					lightnessBase: 30,
					lightnessHigh: 45,
					lightnessLow: 15,
					saturation: 0
				}
			}

			resolve(color)
			document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`)
			document.documentElement.style.setProperty(
				'--base-color',
				`hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`
			)
			document.documentElement.style.setProperty(
				'--high-color',
				`hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`
			)
		})
	})
}
