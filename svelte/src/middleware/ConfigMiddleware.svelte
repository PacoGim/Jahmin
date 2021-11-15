<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../services/ipc.service'
	import {
		albumArtSizeConfig,
		songListTagsConfig,
		equalizerIdConfig,
		themeConfig,
		songAmountConfig
	} from '../store/config.store'

	import type { ConfigType } from '../types/config.type'

	import { setItemToLocalStorage, getItemFromLocalStorage } from '../functions/asyncLocalStorage.fn'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			$themeConfig = syncConfigLocalStorage('Theme', config.userOptions.theme)
			$equalizerIdConfig = syncConfigLocalStorage('EqualizerId', config.userOptions.equalizerId)
			$albumArtSizeConfig = syncConfigLocalStorage('AlbumArtSize', String(config.art.dimension))
			$songListTagsConfig = syncConfigLocalStorage('SongListTags', config.songListTags)
			$songAmountConfig = syncConfigLocalStorage('SongAmount', config.userOptions.songAmount)
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
