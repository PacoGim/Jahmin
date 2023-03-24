import { getConfig } from '../services/config.service'
import fs from 'fs'
import path from 'path'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-lang-file', () => {
		let lang = getConfig().userOptions.language

		let langFilePath = path.join(__dirname, `../i18n/${lang}.json`)

		if (fs.existsSync(langFilePath)) {
			let langFile = fs.readFileSync(langFilePath, 'utf8')
			return langFile
		} else {
			return "{}"
		}
	})
}
