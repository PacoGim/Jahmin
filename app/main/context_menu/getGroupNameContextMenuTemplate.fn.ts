import { MenuItemConstructorOptions } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import { getConfig } from '../services/config.service'

export default function () {
	let template: MenuItemConstructorOptions[] = []

	let tags = ['Artist', 'Genre', 'Composer', 'Year', 'Disc #', 'Extension']

	let groupName = getConfig().group?.groupBy || 'Genre'

	// Removes the current tag from the list.
	tags.splice(tags.indexOf(groupName), 1)

	// Then adds the current tag to the begining of  the list.
	tags.unshift(groupName)

	tags.forEach(tag => {
		template.push({
			label: `${groupName === tag ? '•' : ''} ${tag}`,
			enabled: groupName !== tag,
			click: () => {
				sendWebContentsFn('group-selected', {
					groupName: tag
				})
			}
		})
	})

	return template
}
