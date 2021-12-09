<script lang="ts">
	import { onMount } from 'svelte'

	import OptionSection from '../../../components/OptionSection.svelte'

	let isDynamicThemeEnabled = true

	let rgbColor = {
		red: 0,
		green: 0,
		blue: 0
	}

	let hslColor = {
		hue: 0,
		saturation: 0,
		lightness: 0
	}

	$: {
		rgbColor
		setRgbTheme()
	}

	$: {
		if (isDynamicThemeEnabled) {
			document.documentElement.style.setProperty('--status-bar-color', 'var(--low-color)')
		}
	}

	function setRgbTheme() {
		if (!isDynamicThemeEnabled) {
			document.documentElement.style.setProperty(
				'--status-bar-color',
				`rgb(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue})`
			)
		}
	}
</script>

<OptionSection title="Status Bar Colors">
	<status-bar-config slot="body">
		<dynamic-theme>
			<label for="dyna-theme">Dynamic Theme</label>
			<input type="checkbox" id="dyna-theme" bind:checked={isDynamicThemeEnabled} />
		</dynamic-theme>
		<br />
		<rgb-sliders>
			<input type="range" min="0" max="255" bind:value={rgbColor.red} />
			<input type="range" min="0" max="255" bind:value={rgbColor.green} />
			<input type="range" min="0" max="255" bind:value={rgbColor.blue} />
		</rgb-sliders>

		<color-preview />
	</status-bar-config>
</OptionSection>

<style>
	color-preview {
		display: block;
		background-color: var(--status-bar-color);
		height: 24px;
		width: 48px;
	}
</style>
