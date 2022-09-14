import path from 'path'
import fs from 'fs'
import getAppDataPathFn from './getAppDataPath.fn'

export default function () {
	return new Promise(resolve => {
		let artPath = path.join(getAppDataPathFn(), 'arts')

		if (fs.existsSync(artPath)) {
			fs.rm(artPath, { recursive: true }, () => {
				resolve(true)
			})
		} else {
			resolve(false)
		}
	})
}
