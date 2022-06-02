import sharp from 'sharp'
import { ColorType, ColorTypeShell } from '../types/color.type'

import { getAllowedFiles } from './albumArt.service'
import { getConfig } from './config.service'

import fs from 'fs'
import mm from 'music-metadata'
import path from 'path'
import { getStorageMap } from './storage.service'
import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'
import getFileExtensionFn from '../functions/getFileExtension.fn'

let contrastRatio = getConfig().userOptions.contrastRatio!

const notCompress = ['mp4', 'webm', 'apng', 'gif']

let previousContrastRatio: number | undefined = undefined

export async function getAlbumColors(rootDir: string, contrast: number | undefined): Promise<ColorType | undefined> {
	return new Promise(async (resolve, reject) => {
		if (contrast) {
			contrastRatio = contrast
		}

		if (rootDir === undefined || rootDir === 'undefined') {
			return resolve(undefined)
		}

		const imagePaths = getAllowedFiles(rootDir).filter(file => !notCompress.includes(getExtension(file)))

		if (imagePaths === undefined) {
			return resolve(undefined)
		}

		let imagePath: string | Buffer = imagePaths[0]

		// If no images found in directory
		if (imagePath === undefined) {
			// Find the first valid song file
			let firstValidFileFound = fs
				.readdirSync(rootDir)
				.find(file => allowedSongExtensionsVar.includes(getFileExtensionFn(file) || ''))

			// If valid song file found
			if (firstValidFileFound) {
				// Get its album art
				let common = (await mm.parseFile(path.join(rootDir, firstValidFileFound))).common

				const cover = mm.selectCover(common.picture) // pick the cover image

				// If no cover found, just return
				if (cover === null) {
					return resolve(undefined)
				} else {
					// Sets the image path to the album art buffer
					imagePath = cover?.data
				}
			} else {
				// If no valid song file found, just return
				return resolve(undefined)
			}
		}

		// Check again if imagePath is undefined
		if (imagePath === undefined) {
			return resolve(undefined)
		}

		sharp(imagePath)
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

				let hslColor = hexToHsl(hexColor)!

				getTwoContrastedHslColors(hslColor).then((data: any) => {
					hslColorObject.hue = hslColor.h
					hslColorObject.saturation = hslColor.s
					hslColorObject.lightnessBase = hslColor.l
					hslColorObject.lightnessHigh = data.colorHigh.l
					hslColorObject.lightnessLow = data.colorLow.l

					resolve(hslColorObject)
				})
			})
	})
}

function getExtension(data: string) {
	return data.split('.').pop() || ''
}

function getTwoContrastedHslColors(hslColor: { h: number; s: number; l: number }) {
	return new Promise((resolve, reject) => {
		recursiveLuminanceFinder(hslColor).then(data => {
			resolve(data)
		})
	})
}

function recursiveLuminanceFinder(
	hslBaseColor: { h: number; s: number; l: number },
	luminanceIndex = 0
): Promise<{ colorLow: { h: number; s: number; l: number }; colorHigh: { h: number; s: number; l: number } }> {
	return new Promise((resolve, reject) => {
		let lowLuminance = hslBaseColor.l - luminanceIndex
		let highLuminance = hslBaseColor.l + luminanceIndex

		if (lowLuminance < 0) lowLuminance = 0

		if (highLuminance > 100) highLuminance = 100

		let hslBaseColorLow = { ...hslBaseColor, l: lowLuminance }
		let hslBaseColorHigh = { ...hslBaseColor, l: highLuminance }

		let ratio = getTwoHslColorsContrastRatio(hslBaseColorLow, hslBaseColorHigh)

		if (ratio < 1 / contrastRatio || previousContrastRatio === ratio) {
			previousContrastRatio = undefined
			return resolve({ colorLow: hslBaseColorLow, colorHigh: hslBaseColorHigh })
		} else {
			previousContrastRatio = ratio
			return resolve(recursiveLuminanceFinder(hslBaseColor, luminanceIndex + 1))
		}
	})
}

function getTwoHslColorsContrastRatio(
	colorLow: { h: number; s: number; l: number },
	colorHigh: { h: number; s: number; l: number }
) {
	let colorLowRgb = convertHslColorToRgb(colorLow.h, colorLow.s, colorLow.l)
	let colorHighRgb = convertHslColorToRgb(colorHigh.h, colorHigh.s, colorHigh.l)

	let colorLowLuminance = luminance(colorLowRgb.r, colorLowRgb.g, colorLowRgb.b)
	let colorHighLuminance = luminance(colorHighRgb.r, colorHighRgb.g, colorHighRgb.b)

	const ratio =
		colorLowLuminance > colorHighLuminance
			? (colorHighLuminance + 0.05) / (colorLowLuminance + 0.05)
			: (colorLowLuminance + 0.05) / (colorHighLuminance + 0.05)

	return ratio
}

function luminance(r: number, g: number, b: number) {
	var a = [r, g, b].map(function (v) {
		v /= 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	})
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function convertHslColorToRgb(h: number, s: number, l: number) {
	s /= 100
	l /= 100

	let c = (1 - Math.abs(2 * l - 1)) * s
	let x = c * (1 - Math.abs(((h / 60) % 2) - 1))
	let m = l - c / 2
	let rgb = [0, 0, 0]
	let i = Math.floor(h / 60)

	if (i === 0) {
		rgb = [c, x, 0]
	} else if (i === 1) {
		rgb = [x, c, 0]
	} else if (i === 2) {
		rgb = [0, c, x]
	} else if (i === 3) {
		rgb = [0, x, c]
	} else if (i === 4) {
		rgb = [x, 0, c]
	} else if (i === 5) {
		rgb = [c, 0, x]
	}

	rgb = rgb.map(x => Math.round((x + m) * 255))

	return {
		r: rgb[0],
		g: rgb[1],
		b: rgb[2]
	}
}

function hexToHsl(hex: string) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

	if (!result) {
		return null
	}

	let r = parseInt(result[1], 16)
	let g = parseInt(result[2], 16)
	let b = parseInt(result[3], 16)
	;(r /= 255), (g /= 255), (b /= 255)

	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let h
	let s
	let l = (max + min) / 2

	if (max == min) {
		h = s = 0
	} else {
		let d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}

		if (h === undefined) {
			return null
		}

		h /= 6
	}

	return {
		h: Math.floor(h * 360),
		s: Math.floor(s * 100),
		l: Math.floor(l * 100)
	}
}
