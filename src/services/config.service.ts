import { ConfigType } from '../types/config.type'

import fs from 'fs'
import path from 'path'

import deepmerge from 'deepmerge'
import { appDataPath } from '..'

const getConfigPathFile = () => {
	const configFileName = 'config.json'
	const configFilePath = path.join(appDataPath, configFileName)

	if (!fs.existsSync(appDataPath)) {
		fs.mkdirSync(appDataPath)
	}

	return configFilePath
}

export function getConfig(): ConfigType {
	let config: ConfigType

	if (fs.existsSync(getConfigPathFile())) {
		try {
			config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' }))
		} catch (error) {
			config = getDefaultConfigFile()
		}
	} else {
		config = getDefaultConfigFile()
	}

	if (config?.['order']?.['grouping'] === undefined || config?.['order']?.['grouping']?.length === 0) {
		config['order']['grouping'] = ['Extension', 'Genre', 'AlbumArtist', 'Album']
	}

	return config
}

export function saveConfig(newConfig: any) {
	// console.log(newConfig)
	let config = getConfig()

	config = deepmerge(config, newConfig, { arrayMerge: (destinationArray: any[], sourceArray: any[]) => sourceArray })

	try {
		fs.writeFileSync(getConfigPathFile(), JSON.stringify(config, null, 2))
		return config
	} catch (error) {
		return false
	}
}

function getDefaultConfigFile() {
	return {
		order: {
			grouping: ['Extension', 'Genre', 'AlbumArtist', 'Album'],
			filtering: []
		}
	}
}
// function getDefaultConfigFile() {
// 	return {
// 		order: {
// 			grouping: ['Genre'],
// 			filtering: []
// 		}
// 	}
// }
