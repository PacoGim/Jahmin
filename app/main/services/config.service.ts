import { ConfigType, PartialConfigType, ThemeOptions } from '../../types/config.type'

import * as fs from 'fs'
import * as path from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import verifyConfigFileFn from '../functions/verifyConfigFile.fn'
const deepmerge = require('deepmerge')

function getConfigPathFile() {
	const configFileName = 'config.json'

	const configFilePath = path.join(getAppDataPathFn(), configFileName)

	if (!fs.existsSync(getAppDataPathFn())) {
		fs.mkdirSync(getAppDataPathFn())
	}

	return configFilePath
}

export function getConfig(): ConfigType {
	if (fs.existsSync(getConfigPathFile())) {
		try {
			let config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' })) as ConfigType

			return verifyConfigFileFn(config, getDefaultConfigFile())
		} catch (error) {
			return getDefaultConfigFile()
		}
	} else {
		return getDefaultConfigFile()
	}
}

export function saveConfig(newConfig: PartialConfigType | any) {
	let config = getConfig()

	config = deepmerge(config, newConfig, { arrayMerge: (destinationArray: any[], sourceArray: any[]) => sourceArray })

	try {
		fs.writeFileSync(getConfigPathFile(), JSON.stringify(config, null, 2))
		return config
	} catch (error) {
		return false
	}
}

function getDefaultConfigFile(): ConfigType {
	return {
		group: {
			groupBy: 'Genre',
			groupByValue: ''
		},
		directories: {
			add: [],
			exclude: []
		},
		groupOnlyByFolder: false,
		userOptions: {
			language: 'english',
			songAmount: 8,
			theme: ThemeOptions.SystemBased,
			artSize: 128,
			gridGap: 16,
			contrastRatio: 4.5,
			fontSize: 16,
			pauseAnimatedArtWhenAppUnfocused: true,
			alwaysShowAlbumOverlay: false,
			showDynamicArtists: true,
			showExtensionsIcons: true,
			dateOrder: ['year'],
			isFullscreen: false,
			equalizerHash: '3qu',
			songSort: {
				sortBy: 'Track',
				sortOrder: 'asc'
			},
			lyricsStyle: {
				fontSize: 16,
				fontWeight: 500,
				textAlignment: 0
			}
		},
		songListTags: [
			{ width: 100, value: 'Track' },
			{ width: 100, value: 'Title' },
			{
				width: 100,
				value: 'PlayCount'
			},
			{ width: 100, value: 'Rating' },
			{ width: 100, value: 'Duration' }
		]
	}
}
