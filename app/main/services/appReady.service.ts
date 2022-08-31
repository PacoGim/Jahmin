import sendWebContentsFn from '../functions/sendWebContents.fn'

let isAppReady = false

export default function () {
	if (isAppReady === true) {
		return
	}

	isAppReady = true

	sendWebContentsFn('get-all-songs-from-renderer', undefined)
}
