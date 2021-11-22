import { ConfigType, ThemeOptions } from '../types/config.type'

import fs from 'fs'
import path from 'path'

import deepmerge from 'deepmerge'
import { appDataPath } from '..'

const getConfigPathFile = () => {
	const configFileName = 'config.json'
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
			config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' })) as ConfigType
		} catch (error) {
			config = getDefaultConfigFile()
		}
	} else {
		config = getDefaultConfigFile()
	}

	if (config?.group?.groupBy === undefined || config?.group?.groupBy?.length === 0) {
		config.group = {
			groupBy: ['Extension', 'Genre', 'Album Artist', 'Album'], // TODO Keep only Genre.
			groupByValues: []
		}
	}

	if (config?.songListTags === undefined || config?.songListTags?.length === 0) {
		config.songListTags = [
			{
				align: 'Left',
				name: 'Track',
				size: 'Collapse'
			},
			{
				align: 'Left',
				name: 'Title',
				size: 'Expand'
			},
			{
				align: 'Left',
				name: 'Rating',
				size: 'Collapse'
			},
			{
				align: 'Left',
				name: 'Duration',
				size: 'Collapse'
			}
		]
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
		art: {
			dimension: 128
		},
		groupOnlyByFolder: false,
		userOptions: {
			theme: ThemeOptions.Auto
		},
		songListTags: [
			{
				align: 'Left',
				name: 'Track',
				size: 'Collapse'
			},
			{
				align: 'Left',
				name: 'Title',
				size: 'Expand'
			},
			{
				align: 'Left',
				name: 'Rating',
				size: 'Collapse'
			},
			{
				align: 'Left',
				name: 'Duration',
				size: 'Collapse'
			}
		]
	}
}
