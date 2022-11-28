<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import { config } from '../../../stores/main.store'

	import ColorContrastConfig from './ColorContrastConfig.svelte'
	import DayNightThemeConfig from './DayNightThemeConfig.svelte'
	import FontSizeConfig from './FontSizeConfig.svelte'
	import GridArtSize from './GridArtSize.svelte'
	import GridGapSize from './GridGapSize.svelte'
	import RebuildArtCacheConfig from './RebuildArtCacheConfig.svelte'
</script>

<config-section>
	<OptionSection title="Day|Night Mode">
		<DayNightThemeConfig />
	</OptionSection>

	<OptionSection title="Color Contrast Ratio">
		<ColorContrastConfig />
	</OptionSection>

	<OptionSection title="Other Options" />

	<OptionSectionCompact title="Font Size: {$config.userOptions.fontSize}">
		<FontSizeConfig />
	</OptionSectionCompact>

	<OptionSectionCompact title="Grid Art Size: {$config.userOptions.artSize}">
		<GridArtSize />
	</OptionSectionCompact>

	<OptionSectionCompact title="Grid Art Gap: {$config.userOptions.gridGap}">
		<GridGapSize />
	</OptionSectionCompact>

	<OptionSectionCompact title="Clean Art Cache">
		<RebuildArtCacheConfig />
	</OptionSectionCompact>
</config-section>

<style>
</style>
