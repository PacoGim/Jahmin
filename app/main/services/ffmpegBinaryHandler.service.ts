import { exec } from 'child_process'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import path from 'path'
import { readdirSync } from 'fs'

function checkIfRightVersionFfmpegAvailable(): Promise<string | null | 'SIGKILL'> {
	return new Promise(async (resolve, reject) => {
		let ffmpegVersion = await getFfmpegVersion().catch()

		return resolve(ffmpegVersion)
	})
}

function getFfmpegVersion(): Promise<string | null | 'SIGKILL'> {
	return new Promise((resolve, reject) => {
		try {
			let appDataPath = getAppDataPathFn()
			let ffmpegBinaryFolderPath = path.join(appDataPath, 'ffmpeg')
			let ffmpegBinaryFolderFiles = readdirSync(ffmpegBinaryFolderPath).filter(fileName => fileName.includes('ffmpeg'))
			let ffmpegBinaryPath = ''

			if (ffmpegBinaryFolderFiles.length === 0) {
				ffmpegBinaryPath = 'ffmpeg'
			} else {
				ffmpegBinaryPath = `"${path.join(ffmpegBinaryFolderPath, ffmpegBinaryFolderFiles[0])}"`
			}

			const command = `${ffmpegBinaryPath} -version`

			exec(command, (error, ffmpegVersion, stderr) => {
				if (error?.signal === 'SIGKILL') {
					resolve('SIGKILL')
				} else if (ffmpegVersion) {
					const regex = /ffmpeg version ([0-9.]*)/

					const match = ffmpegVersion.match(regex)
					const version = match?.[1] || null

					resolve(version)
				} else {
					resolve(null)
				}
			})
		} catch (error) {
			resolve(null)
		}
	})
}

export default {
	checkIfRightVersionFfmpegAvailable
}
