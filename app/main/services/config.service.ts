import { ConfigType, ThemeOptions } from '../../types/config.type'

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

export function saveConfig(newConfig: any) {
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
			groupBy: ['Genre'],
			groupByValues: []
		},
		directories: {
			add: [],
			exclude: []
		},
		groupOnlyByFolder: false,
		userOptions: {
			songAmount: 8,
			theme: ThemeOptions.SystemBased,
			artSize: 128,
			gridGap: 16,
			contrastRatio: 4.5,
			fontSize: 16,
			sortBy: 'Track',
			sortOrder: 'asc',
			pauseAnimatedArtWhenAppUnfocused: false,
			lyricsTextAlign: 'left'
		},
		songListTags: [
			{
				align: 'center',
				value: 'Track',
				isExpanded: false
			},
			{
				align: 'left',
				value: 'Title',
				isExpanded: true
			},
			{
				align: 'center',
				value: 'PlayCount',
				isExpanded: false
			},
			{
				align: 'center',
				value: 'Rating',
				isExpanded: false
			},
			{
				align: 'left',
				value: 'Duration',
				isExpanded: false
			},
			{
				align: 'center',
				value: 'DynamicArtists',
				isExpanded: false
			}
		]
	}
}
