<script lang="ts">
	import { onMount } from 'svelte'
	import MoonFillIcon from '../../../icons/MoonFillIcon.svelte'

	import MoonIcon from '../../../icons/MoonIcon.svelte'
	import SunFillIcon from '../../../icons/SunFillIcon.svelte'
	import SunIcon from '../../../icons/SunIcon.svelte'
	import SystemFillIcon from '../../../icons/SystemFillIcon.svelte'
	import SystemIcon from '../../../icons/SystemIcon.svelte'

	let selectedTheme: 'systemBased' | 'light' | 'dark' = 'systemBased'

	let iconsStyle = 'height: 4rem;margin-bottom: 1rem;fill: var(--color-fg-1);transition: all 300ms ease-in-out;'

	onMount(() => {
		const themeSections = document.querySelectorAll('theme-section')

		themeSections.forEach((themeSection: HTMLElement) => {
			themeSection.addEventListener('mouseup', e => {
				selectedTheme = themeSection.dataset.theme as 'systemBased' | 'light' | 'dark'
			})
		})
	})
</script>

<config-section>
	<section-title>Light|Dark Mode</section-title>

	<section-body>
		<theme-section data-theme="systemBased">
			<section-icon>
				<SystemFillIcon style="opacity:{selectedTheme === 'systemBased' ? '1' : '0'};{iconsStyle}" />
				<SystemIcon style="opacity:{selectedTheme !== 'systemBased' ? '1' : '0'};{iconsStyle}" />
			</section-icon>

			<theme-name>System Based</theme-name>
		</theme-section>
		<theme-section data-theme="light">
			<section-icon>
				<SunFillIcon style="opacity:{selectedTheme === 'light' ? '1' : '0'};{iconsStyle}" />
				<SunIcon style="opacity:{selectedTheme !== 'light' ? '1' : '0'};{iconsStyle}" />
			</section-icon>

			<theme-name>Light/Day</theme-name>
		</theme-section>
		<theme-section data-theme="dark">
			<section-icon>
				<MoonFillIcon style="opacity:{selectedTheme === 'dark' ? '1' : '0'};{iconsStyle}" />

				<MoonIcon style="opacity:{selectedTheme !== 'dark' ? '1' : '0'};{iconsStyle}" />
			</section-icon>

			<theme-name>Dark/Night</theme-name>
		</theme-section>
	</section-body>
</config-section>

<style>
	config-section {
	}

	section-title {
		font-size: 1.2rem;
		display: block;
		border-bottom: 2px var(--color-fg-1) solid;
		margin-bottom: 1rem;
	}

	section-body {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}

	theme-section {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100px;
		cursor: pointer;
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
