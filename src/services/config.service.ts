import { ConfigType } from '../types/config.type'

import fs from 'fs'
import path from 'path'

import beautifyJSON from 'json-beautify'
import { App } from 'electron'

const getConfigPathFile = (app:App) => {
	const appDataPath = path.join(app.getPath('appData'), 'Jahmin')
	const configFileName = 'config.json'
	const configFilePath = path.join(appDataPath, configFileName)

	if (!fs.existsSync(appDataPath)) {
		fs.mkdirSync(appDataPath)
	}

	return configFilePath
}

export function loadConfig(app: App): ConfigType {
	let config: ConfigType

	if (fs.existsSync(getConfigPathFile(app))) {
		try {
			config = JSON.parse(fs.readFileSync(getConfigPathFile(app), { encoding: 'utf-8' }))
		} catch (error) {
			//TODO Alert Config File Error
			config = getDefaultConfigFile()
		}
	} else {
		config = getDefaultConfigFile()
	}

	return config
}

export function saveConfig(app: App, newConfig: any) {
	let config = loadConfig(app)

	config = Object.assign(config, newConfig)

	fs.writeFileSync(getConfigPathFile(app), beautifyJSON(config, null, 2, 0))
}

function getDefaultConfigFile() {
	return {
		bounds: undefined
	}
}
