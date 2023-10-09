import { download, Options } from 'electron-dl'
import os from 'os'
import { getMainWindow } from '../main'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import path, { join, resolve } from 'path'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import fs from 'fs'
import yauzl from 'yauzl'

let ffmpegPaths: any = {
	darwin: {
		arm: {
			path: 'https://www.osxexperts.net/ffmpeg6arm.zip',
			hash: ''
		},
		intel: {
			path: 'https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip',
			hash: ''
		}
	}
}

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('start-ffmpeg-download', async () => {
		let osInfo = getUserOS()

		let ffmpegDownloadInfo = ffmpegPaths[osInfo.platform][osInfo.arch]

		startDownload(ffmpegDownloadInfo.path)
	})
}

function getUserOS() {
	const osInfo = {
		platform: os.platform(),
		arch: os.arch()
	}

	if (osInfo.platform === 'darwin') {
		if (osInfo.arch === 'arm64') {
			osInfo.arch = 'arm'
		} else if (osInfo.arch === 'x64') {
			osInfo.arch = 'intel'
		}
	}

	return osInfo
}

function startDownload(url: string) {
	const options: Options = {
		directory: join(getAppDataPathFn(), 'ffmpeg'),
		onProgress(progress) {
			sendWebContentsFn('ffmpeg-download', {
				operation: 'Downloading',
				progress: Math.round(progress.percent * 100)
			})
		},
		onCompleted(fileDownloadedInfo) {
			sendWebContentsFn('ffmpeg-download', {
				operation: 'Download done',
				progress: 100
			})
			uncompressFile(fileDownloadedInfo.path)
		}
	}

	download(getMainWindow(), url, options)
		.then(() => {
			resolve('Done')
		})
		.catch(error => {
			console.log(error)
			resolve(error)
		})
}

function uncompressFile(filePath: string) {
	const outputDir = path.dirname(filePath)
	const writeStream = fs.createWriteStream(path.join(outputDir, 'ffmpeg'), {
		mode: 0o755
	})

	yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
		if (err) throw err

		zipfile.readEntry()

		zipfile.on('entry', entry => {
			if (/\/$/.test(entry.fileName)) {
				zipfile.readEntry()
			} else {
				zipfile.openReadStream(entry, (err, readStream) => {
					if (err) throw err

					const chunks = []
					let bytesRead = 0
					const totalBytes = entry.uncompressedSize

					readStream.on('data', chunk => {
						chunks.push(chunk)
						bytesRead += chunk.length

						const percentComplete = Math.round((bytesRead / totalBytes) * 100)

						sendWebContentsFn('ffmpeg-download', {
							operation: 'Unzipping',
							progress: percentComplete
						})
					})

					readStream.on('end', () => {
						sendWebContentsFn('ffmpeg-download', {
							operation: 'Process done',
							progress: 100
						})
						fs.unlink(filePath, () => {})
					})

					readStream.pipe(writeStream)
				})
			}
		})
	})
}
