import { Menu } from 'electron'
import sendWebContentsFn from './sendWebContents.fn'
import { getArtist, getIsPlaying, getTitle } from '../services/player.service'
import limitCharactersFn from './limitCharacters.fn'

export default function () {
	return Menu.buildFromTemplate([
		{
			label: 'Now Playing',
			enabled: false
		},
		{
			label: `   ${limitCharactersFn(getTitle())}`,
			enabled: false
		},
		{
			label: `   ${limitCharactersFn(getArtist())}`,
			enabled: false
		},
		{
			type: 'separator'
		},
		{
			label: getIsPlaying() === true ? 'Pause' : 'Play',

			click: () => {
				sendWebContentsFn('media-key-pressed', 'MediaPlayPause')
			}
		},

		{
			label: 'Next',
			click: () => {
				sendWebContentsFn('media-key-pressed', 'MediaNextTrack')
			}
		},
		{
			label: 'Previous',
			click: () => {
				sendWebContentsFn('media-key-pressed', 'MediaPreviousTrackForce')
			}
		}
	])
}
