import { ConfigType, ThemeOptions } from '../../types/config.type'

import * as fs from 'fs'
import * as path from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

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
	let config: ConfigType

	if (fs.existsSync(getConfigPathFile())) {
		try {
			config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' })) as ConfigType
		} catch (error) {
			config = getDefaultConfigFile()
		}
	} else {
		config = getDefaultConfigFile()
	}

	if (config?.group?.groupBy === undefined || config?.group?.groupBy?.length === 0) {
		config.group = getDefaultConfigFile().group
	}

	if (config?.songListTags === undefined || config?.songListTags?.length === 0) {
		config.songListTags = getDefaultConfigFile().songListTags
	}

	if (config?.userOptions === undefined) {
		config.userOptions = getDefaultConfigFile().userOptions
	} else {
		if (config?.userOptions?.contrastRatio === undefined) {
			config.userOptions.contrastRatio = getDefaultConfigFile().userOptions?.contrastRatio
		}

		if (config?.userOptions?.fontSize === undefined) {
			config.userOptions.fontSize = getDefaultConfigFile().userOptions?.fontSize
		}

		if (config?.userOptions?.sortBy === undefined) {
			config.userOptions.sortBy = getDefaultConfigFile().userOptions?.sortBy
		}

		if (config?.userOptions?.sortOrder === undefined) {
			config.userOptions.sortOrder = getDefaultConfigFile().userOptions?.sortOrder
		}

		if (config?.userOptions?.songAmount === undefined) {
			config.userOptions.songAmount = getDefaultConfigFile().userOptions?.songAmount
		}

		if (config?.userOptions?.artSize === undefined) {
			config.userOptions.artSize = getDefaultConfigFile().userOptions?.artSize
		}

		if (config?.userOptions?.gridGap === undefined) {
			config.userOptions.gridGap = getDefaultConfigFile().userOptions?.gridGap
		}

		if (config?.userOptions?.theme === undefined) {
			config.userOptions.theme = getDefaultConfigFile().userOptions?.theme
		}

		if (config?.directories === undefined) {
			config.directories = getDefaultConfigFile().directories
		}

		if (config?.directories?.add === undefined) {
			config.directories!.add = getDefaultConfigFile().directories?.add
		}

		if (config?.directories?.exclude === undefined) {
			config.directories!.exclude = getDefaultConfigFile().directories?.exclude
		}
	}

	return config
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
			pauseAnimatedArtWhenAppUnfocused:false
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
