<script lang="ts">
	import { onMount } from 'svelte'
	import MoonFillIcon from '../../../icons/MoonFillIcon.svelte'

	import MoonIcon from '../../../icons/MoonIcon.svelte'
	import SunFillIcon from '../../../icons/SunFillIcon.svelte'
	import SunIcon from '../../../icons/SunIcon.svelte'
	import SystemFillIcon from '../../../icons/SystemFillIcon.svelte'
	import SystemIcon from '../../../icons/SystemIcon.svelte'
	import { saveConfig } from '../../../services/ipc.service'
	import { themeConfig } from '../../../store/config.store'
	import type { ThemeOptions } from '../../../types/config.type'

	let iconsStyle = 'height: 4rem;margin-bottom: 1rem;fill: var(--color-fg-1);transition: all 300ms ease-in-out;'

	function saveThemeToConfig(themeName: string) {
		saveConfig({
			userOptions: {
				theme: themeName as ThemeOptions
			}
		})

		localStorage.setItem('Theme', themeName)
		$themeConfig = themeName as ThemeOptions
	}

	onMount(() => {
		const themeSections = document.querySelectorAll('theme-section')

		themeSections.forEach((themeSection: HTMLElement) => {
			themeSection.addEventListener('mouseup', e => {
				$themeConfig = themeSection.dataset.theme as ThemeOptions
			})
		})
	})
</script>

<section-body>
	<theme-section
		data-theme="SystemBased"
		data-selected={$themeConfig === 'SystemBased' ? 'true' : 'false'}
		on:click={() => saveThemeToConfig('SystemBased')}
	>
		<section-icon>
			<SystemFillIcon style="opacity:{$themeConfig === 'SystemBased' ? '1' : '0'};{iconsStyle}" />
			<SystemIcon style="opacity:{$themeConfig !== 'SystemBased' ? '1' : '0'};{iconsStyle}" />
		</section-icon>

		<theme-name>System Based</theme-name>
	</theme-section>
	<theme-section
		data-theme="Day"
		data-selected={$themeConfig === 'Day' ? 'true' : 'false'}
		on:click={() => saveThemeToConfig('Day')}
	>
		<section-icon>
			<SunFillIcon style="opacity:{$themeConfig === 'Day' ? '1' : '0'};{iconsStyle}" />
			<SunIcon style="opacity:{$themeConfig !== 'Day' ? '1' : '0'};{iconsStyle}" />
		</section-icon>

		<theme-name>Day</theme-name>
	</theme-section>
	<theme-section
		data-theme="Night"
		data-selected={$themeConfig === 'Night' ? 'true' : 'false'}
		on:click={() => saveThemeToConfig('Night')}
	>
		<section-icon>
			<MoonFillIcon style="opacity:{$themeConfig === 'Night' ? '1' : '0'};{iconsStyle}" />

			<MoonIcon style="opacity:{$themeConfig !== 'Night' ? '1' : '0'};{iconsStyle}" />
		</section-icon>

		<theme-name>Night</theme-name>
	</theme-section>
</section-body>

<style>
	section-body {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		margin: 0 auto;
		width: var(--clamp-width);
	}

	theme-section {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 128px;
		height: 128px;
		cursor: pointer;
		border: var(--color-fg-1-low) solid 2px;
		border-radius: 4px;
		padding: 0.5rem;

		transition: border-color 300ms ease-in-out;
	}

	theme-section[data-selected='true'] {
		border: var(--color-fg-1) solid 2px;
	}

	theme-section theme-name {
		transition: font-variation-settings 300ms ease-in-out;
	}

	theme-section[data-selected='true'] theme-name {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}
	section-body theme-section section-icon {
		display: grid;
		transition-property: transform opacity;
		transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
		transition-duration: 300ms;
	}

	:global(section-body theme-section section-icon svg) {
		grid-row: 1;
		grid-column: 1;
	}

	theme-section:hover section-icon {
		transform: scale(1.2);
	}

	theme-section:active section-icon {
		transform: scale(1);
	}
</style>
