import { Menu } from 'electron'
import sendWebContentsFn from './sendWebContents.fn'
import { getArtist, getIsPlaying, getTitle } from '../services/player.service'

export default function () {
	return Menu.buildFromTemplate([
    {
      label:'Now Playing',
      enabled:false
    },
    {
      label:'\t'+getTitle(),
      enabled:false
    },
    {
      label:'\t'+getArtist(),
      enabled:false
    },
    {
      type:"separator"
    },
		{
			label: getIsPlaying()===true ? 'Pause' : 'Play',

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
