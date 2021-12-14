import { writable, Writable } from 'svelte/store'
import parseJson from '../functions/parseJson'
import type { ThemeOptions } from '../types/config.type'
import type { SelectedTagType } from '../types/selectedTag.type'

export let artSizeConfig: Writable<number> = writable(Number(localStorage.getItem('AlbumArtSize')))
export let songListTagsConfig: Writable<SelectedTagType[]> = writable(getSongListTagsConfig())
export let equalizerIdConfig: Writable<string> = writable(localStorage.getItem('EqualizerId'))
export let themeConfig: Writable<ThemeOptions> = writable(localStorage.getItem('Theme') as ThemeOptions)
export let songAmountConfig: Writable<number> = writable(Number(localStorage.getItem('SongAmount')))
export let groupByConfig: Writable<string[]> = writable(parseJson(localStorage.getItem('GroupBy')))
export let groupByValuesConfig: Writable<string[]> = writable(parseJson(localStorage.getItem('GroupByValues')))
export let gridGapConfig: Writable<number> = writable(Number(localStorage.getItem('GridGap')))
export let contrastRatioConfig: Writable<number> = writable(Number(localStorage.getItem('ContrastRatio')))

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
