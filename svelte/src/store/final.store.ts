import { writable, Writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'

export let selectedGroupByStore: Writable<string> = writable('')
export let selectedGroupByValueStore: Writable<string> = writable('')

export let albumListStore: Writable<AlbumType[]> = writable([])
