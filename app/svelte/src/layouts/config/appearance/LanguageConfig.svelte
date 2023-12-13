<script lang="ts">
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import TranslateIcon from '../../../icons/TranslateIcon.svelte'
	import { configStore } from '../../../stores/config.store'
	import { currentSongProgressStore } from '../../../stores/main.store'
	import { isPlaying } from '../../../stores/player.store'

	let currentLanguage = $configStore.userOptions.language

	function languageChanged() {
		updateConfigFn({
			userOptions: {
				language: currentLanguage
			}
		}).then(() => {
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

<TranslateIcon
	style="fill:var(--color-fg-1); height: 1.2rem; margin-right: .5rem; transition: fill var(--theme-transition-duration) linear;"
/>
<select bind:value={currentLanguage} on:change={languageChanged}>
	<option value="english">🇬🇧 English</option>
	<option value="french">🇫🇷 Français</option>
</select>

<style>
	select {
		padding: 0.25rem 0.5rem;
		font-size: inherit;

		border-radius: 4px;
		background-color: var(--color-bg-1);
		color: var(--color-fg-1);
		border-color: var(--color-fg-1);

		cursor: pointer;

		transition-property: color, background-color, border-color;
		transition-duration: var(--theme-transition-duration);
		transition-timing-function: linear;
	}
</style>
