import { MenuItemConstructorOptions, shell } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'

import verifyFolderTegrityFn from '../functions/verifyFolderTegrity.fn'

export default function (data: any) {
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Show Folder`,
		click: () => {
			shell.openPath(data.albumRootDir || '')
		}
	})

	template.push({
		label: `Reload Album Data`,
		click: () => {
			if (data.albumRootDir) verifyFolderTegrityFn(data.albumRootDir)
		}
	})

	template.push({
		label: `Reload Album Art`,
		click: () => {
			if (data.albumId) {
				sendWebContentsFn('get-art-sizes', {
					albumId: data.albumId
				})
			}
		}
	})

	return template
}
