<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../services/ipc.service'
	import {
		artSizeConfig,
		songListTagsConfig,
		equalizerNameConfig,
		themeConfig,
		songAmountConfig,
		groupByConfig,
		groupByValuesConfig,
		gridGapConfig,
		contrastRatioConfig,
		directoriesConfig,
		fontSizeConfig,
		sortByConfig,
		sortOrderConfig
	} from '../store/config.store'

	import type { ConfigType } from '../types/config.type'

	import { setItemToLocalStorage, getItemFromLocalStorage } from '../functions/asyncLocalStorage.fn'
	import parseStringFn from '../functions/parseString.fn'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			$themeConfig = syncConfigLocalStorage('Theme', config.userOptions.theme)
			$equalizerNameConfig = syncConfigLocalStorage('EqualizerId', config.userOptions.equalizerName)
			$artSizeConfig = syncConfigLocalStorage('AlbumArtSize', config.userOptions.artSize)
			$songListTagsConfig = syncConfigLocalStorage('SongListTags', config.songListTags)
			$songAmountConfig = syncConfigLocalStorage('SongAmount', config.userOptions.songAmount)
			$contrastRatioConfig = syncConfigLocalStorage('ContrastRatio', config.userOptions.contrastRatio)
			$fontSizeConfig = syncConfigLocalStorage('FontSize', config.userOptions.fontSize)
			$gridGapConfig = syncConfigLocalStorage('GridGap', config.userOptions.gridGap)

			$sortByConfig = syncConfigLocalStorage('SortBy', config.userOptions.sortBy)
			$sortOrderConfig = syncConfigLocalStorage('SortOrder', config.userOptions.sortOrder)

			$groupByConfig = syncConfigLocalStorage('GroupBy', config.group.groupBy)
			$groupByValuesConfig = syncConfigLocalStorage('GroupByValues', config.group.groupByValues)

			$directoriesConfig = syncConfigLocalStorage('Directories', config.directories)

			document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
			document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)
		})
	})

	function syncConfigLocalStorage(key: string, value: any) {
		getItemFromLocalStorage(key).then((item: any) => {
			if (item) {
				if (isItemDifferent(item, value)) {
					console.log('Is different: ', item, value)
					setItemToLocalStorage(key, value)
				}
			} else {
				setItemToLocalStorage(key, value)
			}
		})

		return value
	}

	function isItemDifferent(item1, item2) {
		return JSON.stringify(parseStringFn(item1)) !== JSON.stringify(parseStringFn(item2))
	}
</script>
