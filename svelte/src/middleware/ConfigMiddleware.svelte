<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../services/ipc.service'
	import {
		artSizeConfig,
		songListTagsConfig,
		equalizerIdConfig,
		themeConfig,
		songAmountConfig,
		groupByConfig,
		groupByValuesConfig,
		gridGapConfig
	} from '../store/config.store'

	import type { ConfigType } from '../types/config.type'

	import { setItemToLocalStorage, getItemFromLocalStorage } from '../functions/asyncLocalStorage.fn'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			$themeConfig = syncConfigLocalStorage('Theme', config.userOptions.theme)
			$equalizerIdConfig = syncConfigLocalStorage('EqualizerId', config.userOptions.equalizerId)
			$artSizeConfig = syncConfigLocalStorage('AlbumArtSize', String(config.userOptions.artSize))
			$songListTagsConfig = syncConfigLocalStorage('SongListTags', config.songListTags)
			$songAmountConfig = syncConfigLocalStorage('SongAmount', config.userOptions.songAmount)
			$groupByConfig = syncConfigLocalStorage('GroupBy', config.group.groupBy)
			$groupByValuesConfig = syncConfigLocalStorage('GroupByValues', config.group.groupByValues)
			$gridGapConfig = syncConfigLocalStorage('GridGap', config.userOptions.gridGap)

			document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
			document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)
		})
	})

	function syncConfigLocalStorage(key: string, value: any) {
		getItemFromLocalStorage(key).then((item: any) => {
			if (item) {
				if (item !== value) {
					setItemToLocalStorage(key, value)
				}
			} else {
				setItemToLocalStorage(key, value)
			}
		})

		return value
	}
</script>
