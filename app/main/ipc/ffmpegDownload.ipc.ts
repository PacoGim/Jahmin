import { download, Options } from 'electron-dl'
import os from 'os'
import { getMainWindow } from '../main'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import { join, resolve } from 'path'
import sendWebContentsFn from '../functions/sendWebContents.fn'

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
			sendWebContentsFn('ffmpeg-download', Math.round(progress.percent * 100))
		},
		onCompleted(file) {
			console.log(file)
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
