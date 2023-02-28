import { MenuItemConstructorOptions } from 'electron'

export default function (template: MenuItemConstructorOptions[]) {
	template.push({
		type: 'separator'
	})
}
