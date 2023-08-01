import { ConfigType, UserOptionsType } from '../../types/config.type'

export default function (configFile: ConfigType, defaultConfigFile: ConfigType) {
	if (configFile?.userOptions === undefined) {
		configFile.userOptions = defaultConfigFile.userOptions
	}

	configFile.userOptions = definedDefaults(configFile.userOptions, defaultConfigFile.userOptions) as UserOptionsType

	if (configFile?.group?.groupBy === undefined) {
		configFile.group = defaultConfigFile.group
	}

	if (configFile?.songListTags === undefined || configFile?.songListTags?.length === 0) {
		configFile.songListTags = defaultConfigFile.songListTags
	}

	return configFile
}

function definedDefaults(o: any, defaults: object): any {
	let objectCopy = { ...o }

	Object.entries(defaults).forEach((entry: [string, any]) => {
		if (objectCopy?.[entry[0]] === undefined) {
			objectCopy[entry[0]] = entry[1]
		}
	})

	return objectCopy
}
