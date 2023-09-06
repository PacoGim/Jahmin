<script lang="ts">
	import MoonFillIcon from '../../../icons/MoonFillIcon.svelte'

	import MoonIcon from '../../../icons/MoonIcon.svelte'
	import SunFillIcon from '../../../icons/SunFillIcon.svelte'
	import SunIcon from '../../../icons/SunIcon.svelte'
	import SystemFillIcon from '../../../icons/SystemFillIcon.svelte'
	import SystemIcon from '../../../icons/SystemIcon.svelte'
	import type { ThemeOptions } from '../../../../../types/config.type'
	import { configStore } from '../../../stores/config.store'
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import traduceFn from '../../../functions/traduce.fn'
	// transition: fill var(--theme-transition-duration) linear;
	let iconsStyle = 'height: 4rem;fill: var(--color-fg-1);'

	function saveThemeToConfig(themeName: string) {
		updateConfigFn({
			userOptions: {
				theme: themeName as ThemeOptions
			}
		})
	}
</script>

<day-night-theme-config>
	<theme-section
		data-theme="SystemBased"
		data-selected={$configStore.userOptions.theme === 'SystemBased' ? 'true' : 'false'}
		class="smooth-colors"
		on:click={() => saveThemeToConfig('SystemBased')}
		on:keypress={() => saveThemeToConfig('SystemBased')}
		tabindex="-1"
		role="button"
	>
		<section-icon>
			<SystemFillIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme ===
				'SystemBased'
					? '1'
					: '0'};{iconsStyle}"
			/>
			<SystemIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme !==
				'SystemBased'
					? '1'
					: '0'};{iconsStyle}"
			/>
		</section-icon>

		<theme-name>{traduceFn('System Based')}</theme-name>
	</theme-section>
	<theme-section
		data-theme="Day"
		data-selected={$configStore.userOptions.theme === 'Day' ? 'true' : 'false'}
		class="smooth-colors"
		on:click={() => saveThemeToConfig('Day')}
		on:keypress={() => saveThemeToConfig('Day')}
		tabindex="-1"
		role="button"
	>
		<section-icon>
			<SunFillIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme === 'Day'
					? '1'
					: '0'};{iconsStyle}"
			/>
			<SunIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme !== 'Day'
					? '1'
					: '0'};{iconsStyle}"
			/>
		</section-icon>

		<theme-name>{traduceFn('Day')}</theme-name>
	</theme-section>
	<theme-section
		class="smooth-colors"
		data-theme="Night"
		data-selected={$configStore.userOptions.theme === 'Night' ? 'true' : 'false'}
		on:click={() => saveThemeToConfig('Night')}
		on:keypress={() => saveThemeToConfig('Night')}
		tabindex="-1"
		role="button"
	>
		<section-icon>
			<MoonFillIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme === 'Night'
					? '1'
					: '0'};{iconsStyle}"
			/>

			<MoonIcon
				style="transition:fill 1000ms linear var(--theme-transition-duration);opacity:{$configStore.userOptions.theme !== 'Night'
					? '1'
					: '0'};{iconsStyle}"
			/>
		</section-icon>

		<theme-name>{traduceFn('Night')}</theme-name>
	</theme-section>
</day-night-theme-config>

<style>
	day-night-theme-config {
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
		/* justify-content: center; */
		justify-content: space-evenly;
		width: 9rem;
		height: 9rem;
		cursor: pointer;
		border: var(--color-fg-3) solid 2px;
		border-radius: 4px;
		padding: 0.25rem;
	}

	theme-section[data-selected='true'] {
		border: var(--color-fg-1) solid 2px;
	}

	theme-section theme-name {
		text-align: center;
		transition: font-variation-settings 300ms ease-in-out;
	}

	theme-section[data-selected='true'] theme-name {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}
	day-night-theme-config theme-section section-icon {
		display: grid;
		transition-property: transform opacity;
		transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
		transition-duration: 300ms;
	}

	:global(day-night-theme-config theme-section section-icon svg) {
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
