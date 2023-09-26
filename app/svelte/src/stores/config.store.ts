import { writable, type Writable, get } from 'svelte/store'
import type { ConfigType } from '../../../types/config.type'
import compareObjectsFn from '../functions/compareObjects.fn'

export let configStore: Writable<ConfigType | undefined> = writable(undefined)

export let groupByConfig: Writable<string> = writable('')
export let groupByValueConfig: Writable<string> = writable('')
export let songAmountConfig: Writable<number> = writable(0)
export let themeConfig: Writable<string> = writable('')
export let gridGapConfig: Writable<number> = writable(0)
export let artSizeConfig: Writable<number> = writable(0)
export let fontSizeConfig: Writable<number> = writable(0)
export let songListTagConfig: Writable<ConfigType['songListTags']> = writable([])
export let alwaysShowAlbumOverlayConfig: Writable<boolean> = writable(false)
export let showDynamicArtistsConfig: Writable<boolean> = writable(true)
export let showExtensionsIconsConfig: Writable<boolean> = writable(true)
export let pauseAnimatedArtWhenAppUnfocusedConfig: Writable<boolean> = writable(true)
export let dateOrderConfig: Writable<ConfigType['userOptions']['dateOrder']> = writable([])
export let songSortConfig: Writable<ConfigType['userOptions']['songSort']> = writable()
export let playbackShuffleConfig: Writable<ConfigType['userOptions']['playback']['shuffle']> = writable()
export let playbackRepeatListConfig: Writable<ConfigType['userOptions']['playback']['repeatList']> = writable()
export let playbackRepeatCurrentConfig: Writable<ConfigType['userOptions']['playback']['repeatCurrent']> = writable()

configStore.subscribe(value => {
	if (get(groupByConfig) !== value?.group.groupBy) {
		groupByConfig.set(value?.group.groupBy)
	}

	if (get(groupByValueConfig) !== value?.group.groupByValue) {
		groupByValueConfig.set(value?.group.groupByValue)
	}

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

	if (!compareObjectsFn(get(songListTagConfig), value?.songListTags)) {
		songListTagConfig.set(value?.songListTags)
	}

	if (get(alwaysShowAlbumOverlayConfig) !== value?.userOptions.alwaysShowAlbumOverlay) {
		alwaysShowAlbumOverlayConfig.set(value?.userOptions.alwaysShowAlbumOverlay)
	}

	if (get(showDynamicArtistsConfig) !== value?.userOptions.showDynamicArtists) {
		showDynamicArtistsConfig.set(value?.userOptions.showDynamicArtists)
	}

	if (get(showExtensionsIconsConfig) !== value?.userOptions.showExtensionsIcons) {
		showExtensionsIconsConfig.set(value?.userOptions.showExtensionsIcons)
	}

	if (get(pauseAnimatedArtWhenAppUnfocusedConfig) !== value?.userOptions.pauseAnimatedArtWhenAppUnfocused) {
		pauseAnimatedArtWhenAppUnfocusedConfig.set(value?.userOptions.pauseAnimatedArtWhenAppUnfocused)
	}

	if (get(dateOrderConfig) !== value?.userOptions.dateOrder) {
		dateOrderConfig.set(value?.userOptions.dateOrder)
	}

	if (!compareObjectsFn(get(songSortConfig), value?.userOptions.songSort)) {
		songSortConfig.set(value?.userOptions.songSort)
	}

	if (get(playbackShuffleConfig) !== value?.userOptions.playback.shuffle) {
		playbackShuffleConfig.set(value?.userOptions.playback.shuffle)
	}

	if (get(playbackRepeatListConfig) !== value?.userOptions.playback.repeatList) {
		playbackRepeatListConfig.set(value?.userOptions.playback.repeatList)
	}

	if (get(playbackRepeatCurrentConfig) !== value?.userOptions.playback.repeatCurrent) {
		playbackRepeatCurrentConfig.set(value?.userOptions.playback.repeatCurrent)
	}
})
