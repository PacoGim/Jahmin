import { globalShortcut } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import { fetchSongsTag } from '../services/librarySongs.service'

let isAppReady = false

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('app-ready', () => {
		if (isAppReady === true) return

		console.timeEnd('App Startup')

		isAppReady = true

		// sendWebContentsFn('get-all-songs-from-renderer', undefined)

		registerGlobalShortcuts()

		fetchSongsTag()
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
