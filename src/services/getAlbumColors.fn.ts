import sharp from 'sharp'
import path from 'path'

import { appDataPath } from '..'
import { getConfig } from './config.service'
import { ColorType, ColorTypeShell } from '../types/color.type'

//@ts-expect-error
import hexToHsl from 'hex-to-hsl'

let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function getAlbumColors(imageId: string): Promise<ColorType> {
	return new Promise((resolve, reject) => {
		let config = getConfig()
		let imagePath = path.join(appDataPath, '/art', String(config?.['art']?.['dimension']), `${imageId}.webp`)

		sharp(imagePath)
			.resize(1, 1)
			.raw()
			.toBuffer((err, buffer) => {
				if (err) {
					return
				}

				let hexColor = buffer.toString('hex')

				let hslColorObject: ColorType = ColorTypeShell()

				const difference = 15

				let hslColor = hexToHsl(hexColor)

				hslColorObject.hue = hslColor[0]
				hslColorObject.saturation = hslColor[1]
				hslColorObject.lightnessBase = hslColor[2]

				if (hslColorObject.lightnessBase + difference > 100) {
					// hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference - 100
					hslColorObject.lightnessHigh = 100 - difference * 3
				} else {
					hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference
				}

				if (hslColorObject.lightnessBase - difference < 0) {
					// hslColorObject.lightnessLow = 100 + hslColorObject.lightnessBase - difference
					hslColorObject.lightnessLow = 0 + difference * 3
				} else {
					hslColorObject.lightnessLow = hslColorObject.lightnessBase - difference
				}

				resolve(hslColorObject)
			})
	})
}
