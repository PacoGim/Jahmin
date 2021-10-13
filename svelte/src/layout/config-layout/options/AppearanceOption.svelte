<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import { saveConfig } from '../../../service/ipc.service'
	import { themeConfig } from '../../../store/config.store'
	import type { ThemeOptions } from '../../../types/config.type'

	function saveThemeToConfig(themeName: string) {
		saveConfig({
			theme: themeName
		})

		localStorage.setItem('Theme', themeName)
		$themeConfig = themeName as ThemeOptions
	}
</script>

<OptionSection title="Preferred Theme">
	<preferred-theme-section slot="body">
		<theme-card data-selected={$themeConfig === 'Auto'} on:click={() => saveThemeToConfig('Auto')}>
			<theme-gradient class="auto" />
			<theme-name>System Default</theme-name>
		</theme-card>

		<theme-card data-selected={$themeConfig === 'Light'} on:click={() => saveThemeToConfig('Light')}>
			<theme-gradient class="light" />
			<theme-name>Light</theme-name>
		</theme-card>

		<theme-card data-selected={$themeConfig === 'Dark'} on:click={() => saveThemeToConfig('Dark')}>
			<theme-gradient class="dark" />
			<theme-name>Dark</theme-name>
		</theme-card>
	</preferred-theme-section>
</OptionSection>

<style>
	p {
		padding: 0.5rem 1rem;
		color: var(--primary-color);

		transition: color 500ms linear;
	}

	preferred-theme-section {
		display: flex;
		justify-content: space-evenly;
	}

	theme-card {
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px var(--color-fg-1) solid;
		padding: 1rem;

		border-radius: 5px;

		transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	theme-card:hover {
		transform: scale(1.025);
	}

	theme-card:hover theme-gradient {
		transform: scale(1.05);
	}

	theme-card[data-selected='true'] theme-name {
		box-shadow: inset 0 -1px 0 var(--color-fg-1);
	}

	theme-card theme-gradient {
		display: block;
		width: 10rem;
		height: 10rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
		border-radius: inherit;

		transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	theme-card theme-gradient.auto {
		background: linear-gradient(to bottom right, #fff6b7, #f6416c, #3b2667, #bc78ec);
	}

	theme-card theme-gradient.light {
		background: linear-gradient(to bottom right, #fff6b7, #f6416c);
	}

	theme-card theme-gradient.dark {
		background: linear-gradient(to bottom, #3b2667, #bc78ec);
	}

	theme-card theme-name {
		margin-top: 1rem;
		transition: box-shadow 150ms ease-in-out;
	}
</style>
