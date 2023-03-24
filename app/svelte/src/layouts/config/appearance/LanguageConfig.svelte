<script lang="ts">
	import { config } from '../../../stores/config.store'
	import { currentSongProgressStore, isPlaying } from '../../../stores/main.store'

	let currentLanguage = $config.userOptions.language

	function languageChanged() {
		window.ipc
			.saveConfig({
				userOptions: {
					language: currentLanguage
				}
			})
			.then(() => {
				localStorage.setItem(
					'afterReload',
					JSON.stringify({
						duration: $currentSongProgressStore,
						wasPlaying: $isPlaying
					})
				)

				window.ipc.reloadApp()
			})
	}
</script>

<select bind:value={currentLanguage} on:change={languageChanged}>
	<option value="english">English</option>
	<option value="french">Français</option>
</select>
