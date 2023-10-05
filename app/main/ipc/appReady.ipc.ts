import { globalShortcut } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'

import { fetchSongsTag } from '../services/librarySongs.service'
import ffmpegBinaryHandlerService from '../services/ffmpegBinaryHandler.service'

let isAppReady = false

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('app-ready', () => {
		if (isAppReady === true) return

		isAppReady = true

		// sendWebContentsFn('get-all-songs-from-renderer', undefined)

		registerGlobalShortcuts()

		fetchSongsTag()

		ffmpegBinaryHandlerService.checkIfRightVersionFfmpegAvailable().then((response: string | null | 'SIGKILL') => {
			if (response === null) {
				// Ask the user to download ffmpeg
				sendWebContentsFn('show-download-ffmpeg-prompt', response)
			} else if (response === 'SIGKILL') {
				// Do something, don't know what yet
			} else {
				// Everything is fine
			}
		})
	})
}

function registerGlobalShortcuts() {
	let isMediaNextTrackRegistered = globalShortcut.register('MediaNextTrack', () => {
		sendWebContentsFn('media-key-pressed', 'MediaNextTrack')
	})

	let isMediaPreviousTrackRegistered = globalShortcut.register('MediaPreviousTrack', () => {
		sendWebContentsFn('media-key-pressed', 'MediaPreviousTrack')
	})

	let isMediaPlayPauseRegistered = globalShortcut.register('MediaPlayPause', () => {
		sendWebContentsFn('media-key-pressed', 'MediaPlayPause')
	})

	if (
		isMediaNextTrackRegistered === false ||
		isMediaPreviousTrackRegistered === false ||
		isMediaPlayPauseRegistered === false
	) {
		sendWebContentsFn('global-shortcuts-registered', false)
	} else {
		sendWebContentsFn('global-shortcuts-registered', true)
	}
}
