import { writable, Writable } from 'svelte/store'
import parseJson from '../functions/parseJson'
import type { ThemeOptions } from '../types/config.type'
import type { SelectedTagType } from '../types/selectedTag.type'

export let albumArtSizeConfig: Writable<string> = writable(localStorage.getItem('AlbumArtSize'))
export let songListTagsConfig: Writable<SelectedTagType[]> = writable(getSongListTagsConfig())
export let equalizerIdConfig: Writable<string> = writable(localStorage.getItem('EqualizerId'))
export let themeConfig: Writable<ThemeOptions> = writable(localStorage.getItem('Theme') as ThemeOptions)
export let songAmountConfig: Writable<number> = writable(Number(localStorage.getItem('SongAmount')))

function getSongListTagsConfig() {
	let songListTagsLS = localStorage.getItem('SongListTags')

	if (songListTagsLS) {
		return [parseJson(songListTagsLS)]
	} else {
		return [
			{ name: 'Track', size: 'Collapse', align: 'Left' },
			{ name: 'Title', size: 'Expand', align: 'Left' },
			{ name: 'Rating', size: 'Collapse', align: 'Left' },
			{ name: 'Duration', size: 'Collapse', align: 'Left' }
		]
	}
}
