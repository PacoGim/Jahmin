<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../service/ipc.service'
	import { albumArtSizeConfig } from '../store/config.store'
	import type { ConfigType } from '../types/config.type'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			syncConfigLocalStorage(config)
		})
	})

	function syncConfigLocalStorage(config: ConfigType) {
		syncArtSize(config)
	}

	function syncArtSize(config: ConfigType) {
		let artSizeConfig = String(config?.art?.dimension)
		let artSizeLS = localStorage.getItem('AlbumArtSize')

		if (artSizeConfig !== undefined && artSizeConfig !== artSizeLS) {
			$albumArtSizeConfig = artSizeConfig
			localStorage.setItem('AlbumArtSize', artSizeConfig)
		}
	}
</script>
