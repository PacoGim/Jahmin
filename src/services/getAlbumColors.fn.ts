import sharp from 'sharp'
import path from 'path'

import { appDataPath } from '..'
import { getConfig } from './config.service'
import { ColorType, ColorTypeShell } from '../types/color.type'

//@ts-expect-error
import hexToHsl from 'hex-to-hsl'
import { getAlbumCover } from './albumArt.service'
import { getStorageMap } from './storage.service'

let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function getAlbumColors(imageId: string): Promise<ColorType | undefined> {
	return new Promise(async (resolve, reject) => {
		let rootDir = getStorageMap().get(imageId)?.RootDir

		if (!rootDir) {
			return resolve(undefined)
		}

		const image = await getAlbumCover(rootDir, true)

		if (image === undefined) {
			return resolve(undefined)
		}

		// let config = getConfig()
		// let imagePath = path.join(appDataPath(), '/art', String(config?.['art']?.['dimension']), `${imageId}.webp`)

		sharp(image.filePath)
			.resize(1, 1)
			.raw()
			.toBuffer((err, buffer) => {
				if (err) {
					return resolve({
						hue: 0,
						lightnessBase: 50,
						lightnessHigh: 25,
						lightnessLow: 75,
						saturation: 0
					})
				}

				let hexColor = buffer.toString('hex').substring(0, 6)

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
