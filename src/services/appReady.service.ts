import { sendWebContents } from '../functions/sendWebContents.fn'

let isAppReady = false

export default function () {
	if (isAppReady === true) {
		return
	}

	isAppReady = true
	sendWebContents('get-all-songs-from-renderer', undefined)
}
