import { ConfigType } from '../../types/config.type'

export default function (configFile: ConfigType, defaultConfigFile: ConfigType) {
	if (configFile?.group?.groupBy === undefined || configFile?.group?.groupBy?.length === 0) {
		configFile.group = defaultConfigFile.group
	}

	if (configFile?.songListTags === undefined || configFile?.songListTags?.length === 0) {
		configFile.songListTags = defaultConfigFile.songListTags
	}

	if (configFile?.userOptions === undefined) {
		configFile.userOptions = defaultConfigFile.userOptions
	} else {
		if (configFile?.userOptions?.contrastRatio === undefined) {
			configFile.userOptions.contrastRatio = defaultConfigFile.userOptions?.contrastRatio
		}

		if (configFile?.userOptions?.fontSize === undefined) {
			configFile.userOptions.fontSize = defaultConfigFile.userOptions?.fontSize
		}

		if (configFile?.userOptions?.sortBy === undefined) {
			configFile.userOptions.sortBy = defaultConfigFile.userOptions?.sortBy
		}

		if (configFile?.userOptions?.sortOrder === undefined) {
			configFile.userOptions.sortOrder = defaultConfigFile.userOptions?.sortOrder
		}

		if (configFile?.userOptions?.songAmount === undefined) {
			configFile.userOptions.songAmount = defaultConfigFile.userOptions?.songAmount
		}

		if (configFile?.userOptions?.artSize === undefined) {
			configFile.userOptions.artSize = defaultConfigFile.userOptions?.artSize
		}

		if (configFile?.userOptions?.gridGap === undefined) {
			configFile.userOptions.gridGap = defaultConfigFile.userOptions?.gridGap
		}

		if (configFile?.userOptions?.theme === undefined) {
			configFile.userOptions.theme = defaultConfigFile.userOptions?.theme
		}

		if (configFile?.directories === undefined) {
			configFile.directories = defaultConfigFile.directories
		}

		if (configFile?.directories?.add === undefined) {
			configFile.directories!.add = defaultConfigFile.directories?.add
		}

		if (configFile?.directories?.exclude === undefined) {
			configFile.directories!.exclude = defaultConfigFile.directories?.exclude
		}
	}

	return configFile
}
