import mediaKeyControlsService from '../services/mediaKeyControls.service'

export default function () {
	navigator.mediaSession.setActionHandler('nexttrack', () => mediaKeyControlsService.nextMedia())
	navigator.mediaSession.setActionHandler('previoustrack', () => mediaKeyControlsService.previousMedia())
	navigator.mediaSession.setActionHandler('play', () => mediaKeyControlsService.togglePlayPauseMedia())
	navigator.mediaSession.setActionHandler('pause', () => mediaKeyControlsService.togglePlayPauseMedia())
}
