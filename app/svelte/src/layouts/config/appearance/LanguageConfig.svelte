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

<div class="select">
	<select bind:value={currentLanguage} on:change={languageChanged}>
		<option value="english">🇬🇧 English</option>
		<option value="french">🇫🇷 Français</option>
	</select>
	<span class="focus" />
</div>

<style>
	div.select {
		margin-left: 1rem;
		--select-border: var(--color-fg-2);
		--select-focus: var(--color-accent-1);
		--select-arrow: var(--select-border);

		display: grid;

		width: 100%;
		min-width: 15ch;
		max-width: 30ch;
		border: 1px solid var(--select-border);
		border-radius: 0.25em;
		padding: 0.25em 0.5em;
		font-size: 1rem;
		cursor: pointer;
		line-height: 1.1;
		background-color: transparent;
		background-image: linear-gradient(to top, #f9f9f9, #fff 33%);

		grid-template-areas: 'select';
		align-items: center;
		position: relative;
	}

	select {
		appearance: none;
		background-color: transparent;
		border: none;
		padding: 0 1em 0 0;
		margin: 0;
		width: 100%;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		cursor: inherit;
		line-height: inherit;
		outline: none;
	}

	div.select::after {
		content: '';
		width: 0.8em;
		height: 0.5em;
		background-color: var(--select-arrow);
		clip-path: polygon(100% 0%, 0 0%, 50% 100%);
		justify-self: end;
	}

	select,
	.select:after {
		grid-area: select;
	}

	select:focus + .focus {
		position: absolute;
		top: -1px;
		left: -1px;
		right: -1px;
		bottom: -1px;
		border: 2px solid var(--select-focus);
		border-radius: inherit;
	}
</style>
