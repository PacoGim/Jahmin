import fs from 'fs'
import path from 'path'

const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

export function getAlbumCover(rootDir: /* Root Directory */ string) {
	return new Promise((resolve, reject) => {
		fs.readdirSync(rootDir).forEach((file) => {
			const ext /*extension*/ = file.split('.').pop()

			if (ext === undefined) return resolve(null)

			if (validExtensions.includes(ext)) {
				return resolve(path.join(rootDir, file))
			}
    })

    // If not image were found.
		return resolve(null)
	})
}
