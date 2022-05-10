import { MenuItemConstructorOptions } from "electron"
import { sendWebContents } from "../services/sendWebContents.service"

export default function (data: any) {
  let groupName = data.groupName
  let index = data.index
  let template: MenuItemConstructorOptions[] = []

  let tags = ['Album', 'Artist', 'Track', 'Title', 'Genre', 'Composer', 'Year', 'Disc #', 'Extension']

  // Removes the current tag from the list.
  tags.splice(tags.indexOf(groupName), 1)

  // Then adds the current tag to the begining of  the list.
  tags.unshift(groupName)

  tags.forEach(tag => {
    template.push({
      label: `${groupName === tag ? '•' : ''} ${tag}`,
      click: () => {
        sendWebContents('new-group', {
          index,
          groupName: tag
        })
      }
    })
  })

  return template
}