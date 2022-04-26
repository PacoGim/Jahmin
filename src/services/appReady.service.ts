import { sendWebContents } from './sendWebContents.service'

let isAppReady = false

export default function () {
	if (isAppReady === true) {
		return
	}

	isAppReady = true
	sendWebContents('get-all-songs-from-renderer', undefined)
}
