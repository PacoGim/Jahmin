<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../service/ipc.service'
	import { albumArtSizeConfig, songListTagsConfig, equalizerIdConfig } from '../store/config.store'
	import type { ConfigType } from '../types/config.type'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			syncConfigLocalStorage(config)
		})
	})

	function syncConfigLocalStorage(config: ConfigType) {
		syncArtSize(config)
		syncSongListTags(config)
		syncEqualizerId(config)
	}

	function syncEqualizerId(config: ConfigType) {
		let equalizerIdConfigFile = config?.equalizerId

		let equalizerIdLS = localStorage.getItem('EqualizerId')

		if (equalizerIdConfigFile !== undefined && equalizerIdConfigFile !== equalizerIdLS) {
			$equalizerIdConfig = equalizerIdConfigFile
			localStorage.setItem('EqualizerId', equalizerIdConfigFile)
		}
	}

	function syncArtSize(config: ConfigType) {
		// Gets the data from config file
		let artSizeConfigFile = String(config?.art?.dimension)

		// Gets the data from local storage
		let artSizeLS = localStorage.getItem('AlbumArtSize')

		// If the data from config file is defined and does not match the local storage
		if (artSizeConfigFile !== undefined && artSizeConfigFile !== artSizeLS) {
			// Update the config store with the config from file
			$albumArtSizeConfig = artSizeConfigFile

			// Update the local storage with the config from file
			localStorage.setItem('AlbumArtSize', artSizeConfigFile)
		}
	}

	function syncSongListTags(config: ConfigType) {
		let songListTagsConfigFile = config?.songListTags

		let songListTagsLS = JSON.parse(localStorage.getItem('SongListTags'))

		if (songListTagsConfigFile !== undefined && songListTagsConfigFile !== songListTagsLS) {
			$songListTagsConfig = songListTagsConfigFile
			localStorage.setItem('SongListTags', JSON.stringify(songListTagsConfigFile))
		}
	}
</script>
