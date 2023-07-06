import type { SelectedTagType } from '../../../types/selectedTag.type'

export default function (tags: SelectedTagType[] | any) {
	let gridStyle = ''

	if (tags.length > 0) {
		tags.forEach(tag => {
			if (tag.isExpanded === false) {
				gridStyle += ' minmax(min-content, max-content)'
			} else if (tag.isExpanded === true) {
				gridStyle += ' auto'
			}
		})
	}

	return gridStyle
}
