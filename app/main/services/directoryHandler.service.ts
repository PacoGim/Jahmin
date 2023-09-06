import { SongType } from '../../types/song.type'
import { getConfig, saveConfig } from './config.service'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import { fetchSongsTag } from './librarySongs.service'

export default function (filePaths: string[], type: 'add' | 'exclude' | 'remove-add' | 'remove-exclude') {
	let config = getConfig()

	let foldersToAdd = config.directories.add || []
	let foldersToExclude = config.directories.exclude || []

	filePaths.forEach((filePath: string) => {
		if (type === 'add' && foldersToAdd.includes(filePath) === false) {
			foldersToAdd.push(filePath)
		} else if (type === 'exclude' && foldersToExclude.includes(filePath) === false) {
			foldersToExclude.push(filePath)
		} else if (type === 'remove-add' && foldersToAdd.includes(filePath) === true) {
			foldersToAdd.splice(foldersToAdd.indexOf(filePath), 1)
		} else if (type === 'remove-exclude' && foldersToExclude.includes(filePath) === true) {
			foldersToExclude.splice(foldersToExclude.indexOf(filePath), 1)
		}
	})

	saveConfig(config)

	sendWebContentsFn('selected-directories', config.directories)

	fetchSongsTag()
}
