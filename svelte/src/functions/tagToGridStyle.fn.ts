import type { SelectedTagType } from '../types/selectedTag.type'

export default function (tags: SelectedTagType[] | any) {
	let gridStyle = ''

	if (tags.length > 0) {
		tags.forEach(tag => {
			if (!(tag.value === 'DynamicArtists' && tags.find(t => t.value === 'Title'))) {
				if (tag.isExpanded === false) {
					gridStyle += ' max-content'
				} else if (tag.isExpanded === true) {
					gridStyle += ' auto'
				}
			}
		})
	}

	return gridStyle
}
