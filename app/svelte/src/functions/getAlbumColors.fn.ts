import type { ColorType } from '../../../types/color.type'

export default function (rootDir: string, contrast = undefined): Promise<ColorType> {
	return new Promise((resolve, reject) => {
		window.ipc.getAlbumColors(rootDir, contrast).then((color: ColorType) => {
			if (color === undefined) {
				color = {
					hue: 0,
					lightnessBase: 30,
					lightnessLight: 45,
					lightnessDark: 15,
					saturation: 0
				}
			}

			resolve(color)
		})
	})
}
