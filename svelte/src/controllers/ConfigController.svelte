<script lang="ts">
	import { onMount } from 'svelte'

	import { getConfigIPC } from '../service/ipc.service'
	import { albumArtSizeConfig, songListTagsConfig } from '../store/config.store'
	import type { ConfigType } from '../types/config.type'

	onMount(() => {
		getConfigIPC().then((config: ConfigType) => {
			syncConfigLocalStorage(config)
		})
	})

	function syncConfigLocalStorage(config: ConfigType) {
		syncArtSize(config)
		syncSongListTags(config)
	}

	function syncArtSize(config: ConfigType) {
		let artSizeConfigFile = String(config?.art?.dimension)
		let artSizeLS = localStorage.getItem('AlbumArtSize')

		if (artSizeConfigFile !== undefined && artSizeConfigFile !== artSizeLS) {
			$albumArtSizeConfig = artSizeConfigFile
			localStorage.setItem('AlbumArtSize', artSizeConfigFile)
		}
	}

	function syncSongListTags(config: ConfigType) {
		let songListTagsConfigFile = config?.userOptions.songListTags

		let songListTagsLS = JSON.parse(localStorage.getItem('SongListTags'))

		if (songListTagsConfig !== undefined && songListTagsConfigFile !== songListTagsLS) {
			songListTagsConfigFile
			$songListTagsConfig = songListTagsConfigFile
			localStorage.setItem('SongListTags', JSON.stringify(songListTagsConfigFile))
		}
	}
</script>
