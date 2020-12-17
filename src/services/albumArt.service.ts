import fs from 'fs'
import path from 'path'

//@ts-ignore
import imageInfo from 'image-info'

const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

export function getAlbumCover(rootDir: /* Root Directory */ string) {
	return new Promise(async (resolve, reject) => {
		let imageArray: string[] = []
		try {
			fs.readdirSync(rootDir).forEach((file) => {
				const ext /*extension*/ = file.split('.').pop()

				if (ext === undefined) return

				if (validExtensions.includes(ext)) {
					// return resolve(path.join(rootDir, file))
					imageArray.push(path.join(rootDir, file))
				}
			})
		} catch (err) {
			return resolve(null)
		}

		// If no image were found.
		// return resolve(null)
		let bestImagePath = await getBestImageFromArray(imageArray)
		console.log(bestImagePath)
		resolve(bestImagePath)
	})
}

type BestImageType = { quality: number; imagePath: string }

function getBestImageFromArray(imageArray: string[]) {
	return new Promise(async (resolve, reject) => {
		let bestImage: BestImageType = { quality: 0, imagePath: '' }

		for (let [index, imagePath] of imageArray.entries()) {
			let quality = await getQuality(imagePath)

			if (quality > bestImage['quality']) {
				// console.log('New Quality: ', quality, ' Old quality: ', bestImage['quality'])
				bestImage = {
					quality,
					imagePath
				}
			}

			//TODO Limit image names or ratio

			if (imageArray.length === index + 1) {
				resolve(bestImage['imagePath'])
			}
		}
	})
}

function getQuality(imagePath: string): Promise<number> {
	return new Promise((resolve, reject) => {
		imageInfo(imagePath, (err: any, info: any) => {
			if (err) {
				return console.log(err)
			} else {
				let quality = info['width'] * info['height'] * info['bytes']

				resolve(quality)
			}
		})
	})
}
