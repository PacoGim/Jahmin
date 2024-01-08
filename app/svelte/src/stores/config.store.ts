import { writable, type Writable, get, type Readable, readable, derived } from 'svelte/store'
import type { ConfigType } from '../../../types/config.type'
import compareObjectsFn from '../functions/compareObjects.fn'

export let configStore: Writable<ConfigType | undefined> = writable(undefined)

const privateSongListTagConfig: Writable<ConfigType['songListTags']> = writable()

export const songListTagConfig: Readable<ConfigType['songListTags']> = derived(
	privateSongListTagConfig,
	$privateSongListTagConfig => $privateSongListTagConfig
)

const privateSongSortConfig: Writable<ConfigType['userOptions']['songSort']> = writable()

export const songSortConfig: Readable<ConfigType['userOptions']['songSort']> = derived(
	privateSongSortConfig,
	$privateSongSortConfig => $privateSongSortConfig
)

export let groupByConfig: Writable<string> = writable('')
export let groupByValueConfig: Writable<string> = writable('')
export let songAmountConfig: Writable<number> = writable(0)
export let themeConfig: Writable<string> = writable('')
export let gridGapConfig: Writable<number> = writable(0)
export let artSizeConfig: Writable<number> = writable(0)
export let fontSizeConfig: Writable<number> = writable(0)
export let alwaysShowAlbumOverlayConfig: Writable<boolean> = writable(false)
export let showDynamicArtistsConfig: Writable<boolean> = writable(true)
export let showExtensionsIconsConfig: Writable<boolean> = writable(true)
export let pauseAnimatedArtWhenAppUnfocusedConfig: Writable<boolean> = writable(true)
export let dateOrderConfig: Writable<ConfigType['userOptions']['dateOrder']> = writable([])

//@ts-expect-error A partial inside a partial triggers this error
export let playbackShuffleConfig: Writable<ConfigType['userOptions']['playback']['shuffle']> = writable()
//@ts-expect-error A partial inside a partial triggers this error
export let playbackRepeatListConfig: Writable<ConfigType['userOptions']['playback']['repeatList']> = writable()
//@ts-expect-error A partial inside a partial triggers this error
export let playbackRepeatCurrentConfig: Writable<ConfigType['userOptions']['playback']['repeatCurrent']> = writable()

configStore.subscribe(value => {
	if (get(groupByConfig) !== value?.group?.groupBy) {
		groupByConfig.set(value?.group?.groupBy || '')
	}

	if (get(groupByValueConfig) !== value?.group?.groupByValue) {
		groupByValueConfig.set(value?.group?.groupByValue || '')
	}

	if (get(songAmountConfig) !== value?.userOptions?.songAmount) {
		songAmountConfig.set(value?.userOptions?.songAmount || 7)
	}

	if (get(themeConfig) !== value?.userOptions?.theme) {
		themeConfig.set(value?.userOptions?.theme || 'SystemBased')
	}

	if (get(gridGapConfig) !== value?.userOptions?.gridGap) {
		gridGapConfig.set(value?.userOptions?.gridGap || 16)
	}

	if (get(artSizeConfig) !== value?.userOptions?.artSize) {
		artSizeConfig.set(value?.userOptions?.artSize || 128)
	}

	if (get(fontSizeConfig) !== value?.userOptions?.fontSize) {
		fontSizeConfig.set(value?.userOptions?.fontSize || 16)
	}

	if (get(alwaysShowAlbumOverlayConfig) !== value?.userOptions.alwaysShowAlbumOverlay) {
		alwaysShowAlbumOverlayConfig.set(value?.userOptions.alwaysShowAlbumOverlay || false)
	}

	if (get(showDynamicArtistsConfig) !== value?.userOptions.showDynamicArtists) {
		showDynamicArtistsConfig.set(value?.userOptions.showDynamicArtists || true)
	}

	if (get(showExtensionsIconsConfig) !== value?.userOptions.showExtensionsIcons) {
		showExtensionsIconsConfig.set(value?.userOptions.showExtensionsIcons || true)
	}

	if (get(pauseAnimatedArtWhenAppUnfocusedConfig) !== value?.userOptions.pauseAnimatedArtWhenAppUnfocused) {
		pauseAnimatedArtWhenAppUnfocusedConfig.set(value?.userOptions.pauseAnimatedArtWhenAppUnfocused || true)
	}

	if (get(dateOrderConfig) !== value?.userOptions.dateOrder) {
		dateOrderConfig.set(value?.userOptions.dateOrder)
	}

	if (!compareObjectsFn(get(privateSongListTagConfig), value?.songListTags)) {
		privateSongListTagConfig.set(value?.songListTags)
	}

	if (!compareObjectsFn(get(privateSongSortConfig), value?.userOptions.songSort)) {
		privateSongSortConfig.set(value?.userOptions.songSort)
	}

	if (get(playbackShuffleConfig) !== value?.userOptions?.playback?.shuffle) {
		playbackShuffleConfig.set(value?.userOptions?.playback?.shuffle || false)
	}

	if (get(playbackRepeatListConfig) !== value?.userOptions?.playback?.repeatList) {
		playbackRepeatListConfig.set(value?.userOptions?.playback?.repeatList || false)
	}

	if (get(playbackRepeatCurrentConfig) !== value?.userOptions?.playback?.repeatCurrent) {
		playbackRepeatCurrentConfig.set(value?.userOptions?.playback?.repeatCurrent || false)
	}
})
