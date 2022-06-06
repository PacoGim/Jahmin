import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import parseJson from '../functions/parseJson'
import type { ThemeOptions } from '../types/config.type'
import type { SelectedTagType } from '../types/selectedTag.type'

export let sortByConfig: Writable<string> = writable(localStorage.getItem('SortBy'))
export let sortOrderConfig: Writable<string> = writable(localStorage.getItem('SortOrder'))

export let artSizeConfig: Writable<number> = writable(Number(localStorage.getItem('AlbumArtSize')))
export let songListTagsConfig: Writable<SelectedTagType[]> = writable(getSongListTagsConfig())
export let equalizerIdConfig: Writable<string> = writable(localStorage.getItem('EqualizerId'))
export let themeConfig: Writable<ThemeOptions> = writable(localStorage.getItem('Theme') as ThemeOptions)
export let songAmountConfig: Writable<number> = writable(Number(localStorage.getItem('SongAmount')))
export let groupByConfig: Writable<string[]> = writable(parseJson(localStorage.getItem('GroupBy')))
export let groupByValuesConfig: Writable<string[]> = writable(parseJson(localStorage.getItem('GroupByValues')))
export let gridGapConfig: Writable<number> = writable(Number(localStorage.getItem('GridGap')))
export let contrastRatioConfig: Writable<number> = writable(Number(localStorage.getItem('ContrastRatio')))
export let fontSizeConfig: Writable<number> = writable(Number(localStorage.getItem('FontSize')))
export let directoriesConfig: Writable<{ add: string[]; exclude: string[] }> = writable(
	parseJson(localStorage.getItem('Directories'))
)

function getSongListTagsConfig() {
	let songListTagsLS = localStorage.getItem('SongListTags')

	if (songListTagsLS) {
		return parseJson(songListTagsLS)
	} else {
		return [
			{ value: 'Track', isExpanded: false, align: 'Left' },
			{ value: 'Title', isExpanded: true, align: 'Left' },
			{ value: 'Rating', isExpanded: false, align: 'Left' },
			{ value: 'Duration', isExpanded: false, align: 'Left' }
		]
	}
}
