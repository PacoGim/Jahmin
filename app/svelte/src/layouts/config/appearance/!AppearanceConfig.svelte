<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import { config } from '../../../stores/main.store'

	import ColorContrastConfig from './ColorContrastConfig.svelte'
	import DayNightThemeConfig from './DayNightThemeConfig.svelte'
	import FontSizeConfig from './FontSizeConfig.svelte'
	import GridArtSize from './GridArtSize.svelte'
</script>

<config-section>
	<OptionSection title="Day|Night Mode">
		<DayNightThemeConfig />
	</OptionSection>

	<OptionSection title="Color Contrast Ratio">
		<ColorContrastConfig />
	</OptionSection>

	<OptionSectionCompact title="Font Size: {$config.userOptions.fontSize}">
		<FontSizeConfig />
	</OptionSectionCompact>

	<OptionSectionCompact title="Grid Art Size: {$config.userOptions.artSize}">
		<GridArtSize />
	</OptionSectionCompact>
</config-section>

<style>
</style>
