import { writable, type Writable, get } from 'svelte/store'
import type { ConfigType } from '../../../types/config.type'

export let config: Writable<ConfigType | undefined> = writable(undefined)

export let songAmountConfig: Writable<number> = writable(0)
export let themeConfig: Writable<string> = writable('')
export let gridGapConfig: Writable<number> = writable(0)
export let artSizeConfig: Writable<number> = writable(0)
export let fontSizeConfig: Writable<number> = writable(0)
export let songListTagConfig: Writable<any[]> = writable([])
export let alwaysShowAlbumOverlayConfig: Writable<boolean> = writable(false)

config.subscribe(value => {
	if (get(songAmountConfig) !== value?.userOptions?.songAmount) {
		songAmountConfig.set(value?.userOptions?.songAmount)
	}

	if (get(themeConfig) !== value?.userOptions?.theme) {
		themeConfig.set(value?.userOptions?.theme)
	}

	if (get(gridGapConfig) !== value?.userOptions?.gridGap) {
		gridGapConfig.set(value?.userOptions?.gridGap)
	}

	if (get(artSizeConfig) !== value?.userOptions?.artSize) {
		artSizeConfig.set(value?.userOptions?.artSize)
	}

	if (get(fontSizeConfig) !== value?.userOptions?.fontSize) {
		fontSizeConfig.set(value?.userOptions?.fontSize)
	}

	if (get(songListTagConfig) !== value?.songListTags) {
		songListTagConfig.set(value?.songListTags)
	}

	if (get(alwaysShowAlbumOverlayConfig) !== value?.userOptions.alwaysShowAlbumOverlay) {
		alwaysShowAlbumOverlayConfig.set(value?.userOptions.alwaysShowAlbumOverlay)
	}
})
