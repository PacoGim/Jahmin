import { getConfig, saveConfig } from './config.service'
import { sendWebContents } from './sendWebContents.service'
import { watchFolders } from './songSync.service'

export default function (filePaths: string[], type: 'add' | 'exclude' | 'remove-add' | 'remove-exclude') {
	let config = getConfig()

	filePaths.forEach((filePath: string) => {
		if (type === 'add' && config.directories.add.includes(filePath) === false) {
			config.directories.add.push(filePath)
		} else if (type === 'exclude' && config.directories.exclude.includes(filePath) === false) {
			config.directories.exclude.push(filePath)
		} else if (type === 'remove-add' && config.directories.add.includes(filePath) === true) {
			config.directories.add.splice(config.directories.add.indexOf(filePath), 1)
		} else if (type === 'remove-exclude' && config.directories.exclude.includes(filePath) === true) {
			config.directories.exclude.splice(config.directories.exclude.indexOf(filePath), 1)
		}
	})

	saveConfig(config)

	sendWebContents('selected-directories', config.directories)

	watchFolders(config.directories)
}
