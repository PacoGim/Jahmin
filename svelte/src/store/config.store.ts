import { writable, Writable } from 'svelte/store'
import type { SelectedTagType } from '../types/selectedTag.type'

export let albumArtSizeConfig: Writable<string> = writable(localStorage.getItem('AlbumArtSize'))
export let songListTagsConfig: Writable<SelectedTagType[]> = writable(getSongListTagsConfig())

function getSongListTagsConfig() {
	let songListTagsLS = localStorage.getItem('SongListTags')

	if (songListTagsLS) {
		return JSON.parse(songListTagsLS)
	} else {
		return [
			{ name: 'Track', size: 'Collapse', align: 'Left' },
			{ name: 'Title', size: 'Expand', align: 'Left' },
			{ name: 'Rating', size: 'Collapse', align: 'Left' },
			{ name: 'Duration', size: 'Collapse', align: 'Left' }
		]
	}
}
