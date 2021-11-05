import { ConfigType, ThemeOptions } from '../types/config.type'
import TOML from '@iarna/toml'

import fs from 'fs'
import path from 'path'

import deepmerge from 'deepmerge'
import { appDataPath } from '..'

const getConfigPathFile = () => {
	const configFileName = 'config.toml'
	const configFilePath = path.join(appDataPath(), configFileName)

	if (!fs.existsSync(appDataPath())) {
		fs.mkdirSync(appDataPath())
	}

	return configFilePath
}

export function getConfig(): ConfigType {
	let config: ConfigType

	if (fs.existsSync(getConfigPathFile())) {
		try {
			config = TOML.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' })) as ConfigType
		} catch (error) {
			config = getDefaultConfigFile()
		}
	} else {
		config = getDefaultConfigFile()
	}

	if (config?.['order']?.['grouping'] === undefined || config?.['order']?.['grouping']?.length === 0) {
		config.order = {
			grouping: ['Extension', 'Genre', 'AlbumArtist', 'Album'],
			filtering: []
		}
	}

	return config
}

export function saveConfig(newConfig: any) {
	let config = getConfig()

	config = deepmerge(config, newConfig, { arrayMerge: (destinationArray: any[], sourceArray: any[]) => sourceArray })

	try {
		fs.writeFileSync(getConfigPathFile(), TOML.stringify(config))
		return config
	} catch (error) {
		return false
	}
}

function getDefaultConfigFile(): ConfigType {
	return {
		order: {
			grouping: ['Extension', 'Genre', 'AlbumArtist', 'Album'],
			filtering: []
		},
		art: {
			dimension: 128
		},
		groupOnlyByFolder: false,
		userOptions: {
			theme: ThemeOptions.Auto
		}
	}
}
