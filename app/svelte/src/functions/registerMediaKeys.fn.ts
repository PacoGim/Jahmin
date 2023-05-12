import mediaKeyControlsService from '../services/mediaKeyControls.service'

export default function () {
	console.log('Keys registered')
	navigator.mediaSession.setActionHandler('nexttrack', () => mediaKeyControlsService.nextMedia())
	navigator.mediaSession.setActionHandler('previoustrack', () => mediaKeyControlsService.previousMedia())

	// navigator.mediaSession.setActionHandler('play', () => {})
	// navigator.mediaSession.setActionHandler('pause', () => {})


}
