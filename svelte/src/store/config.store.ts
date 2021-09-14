import { writable, Writable } from 'svelte/store'
import type { SelectedTagType } from '../types/selectedTag.type'

export let albumArtSizeConfig: Writable<string> = writable(localStorage.getItem('AlbumArtSize'))
export let songListTagsConfig: Writable<SelectedTagType[]> = writable(JSON.parse(localStorage.getItem('SongListTags'))||[{}])
