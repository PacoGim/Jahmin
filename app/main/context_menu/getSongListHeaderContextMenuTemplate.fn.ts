import { MenuItemConstructorOptions } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'

export default function () {
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: 'Reset Columns Width',
		click: () => {
			sendWebContentsFn('reset-columns-width', {})
		}
	})

	/********************** Template Done **********************/
	return template
}
