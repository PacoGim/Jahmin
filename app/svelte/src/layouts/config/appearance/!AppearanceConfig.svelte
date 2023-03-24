<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import traduceFn from '../../../functions/traduce.fn'
	import { config } from '../../../stores/config.store'
	import AlwaysShowAlbumOverlay from './AlwaysShowAlbumOverlay.svelte'

	import ColorContrastConfig from './ColorContrastConfig.svelte'
	import DayNightThemeConfig from './DayNightThemeConfig.svelte'
	import FontSizeConfig from './FontSizeConfig.svelte'
	import GridArtSize from './GridArtSize.svelte'
	import GridGapSize from './GridGapSize.svelte'
	import LanguageConfig from './LanguageConfig.svelte'
	import RebuildArtCacheConfig from './RebuildArtCacheConfig.svelte'
</script>

<config-section>
	<OptionSectionCompact title={traduceFn('Language')}>
		<LanguageConfig />
	</OptionSectionCompact>

	<OptionSection title={traduceFn('Day | Night Mode')}>
		<DayNightThemeConfig />
	</OptionSection>

	<OptionSection title={traduceFn('Color Contrast Ratio')}>
		<ColorContrastConfig />
	</OptionSection>

	<OptionSection title={traduceFn('Other Options')} />

	<OptionSectionCompact title="{traduceFn('Font Size')}: {$config.userOptions.fontSize}">
		<FontSizeConfig />
	</OptionSectionCompact>

	<OptionSectionCompact title="{traduceFn('Grid Art Size')}: {$config.userOptions.artSize}">
		<GridArtSize />
	</OptionSectionCompact>

	<OptionSectionCompact title="{traduceFn('Grid Art Gap')}: {$config.userOptions.gridGap}">
		<GridGapSize />
	</OptionSectionCompact>

	<OptionSectionCompact title={traduceFn('Clean Art Cache')}>
		<RebuildArtCacheConfig />
	</OptionSectionCompact>

	<OptionSectionCompact>
		<AlwaysShowAlbumOverlay />
	</OptionSectionCompact>
</config-section>

<style>
</style>
