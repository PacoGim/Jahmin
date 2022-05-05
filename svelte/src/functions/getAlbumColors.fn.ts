import { getAlbumColorsIPC } from '../services/ipc.service'
import type { ColorType } from '../types/color.type'

export async function getAlbumColors(rootDir: string, contrast = undefined): Promise<ColorType> {
	return new Promise((resolve, reject) => {
		getAlbumColorsIPC(rootDir, contrast).then((color: ColorType) => {
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
		})
	})
}
