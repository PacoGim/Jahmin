import { ConfigType } from '../../types/config.type'
import { join as pathJoin } from 'path'
import { screen } from 'electron'
import fixWindowBoundariesFn from './fixWindowBoundaries.fn'

const deepmerge = require('deepmerge')

export default function (config: ConfigType) {
	let options = {
		title: 'Jahmin',
		x: 0,
		y: 0,
		width: 800,
		height: 800,
		backgroundColor: '#1c2128',
		webPreferences: {
			experimentalFeatures: true,
			preload: pathJoin(__dirname, '../preload/preload.js')
		}
	}

	if (config.bounds !== undefined) {
		const bounds = config.bounds

		const area = screen.getDisplayMatching(bounds).workArea

		options = deepmerge(options, fixWindowBoundariesFn(bounds, area))
	}

	return options
}
