<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import { fontSizeConfig } from '../../../store/config.store'
	import ColorContrastConfig from './ColorContrastConfig.svelte'
	import DayNightThemeConfig from './DayNightThemeConfig.svelte'
	import FontSizeConfig from './FontSizeConfig.svelte'
</script>

<config-section>
	<OptionSection title="Day|Night Mode">
		<DayNightThemeConfig />
	</OptionSection>

	<OptionSection title="Color Contrast Ratio">
		<ColorContrastConfig />
	</OptionSection>

	<OptionSectionCompact title="Font Size: {$fontSizeConfig}">
		<FontSizeConfig />
	</OptionSectionCompact>
</config-section>

<style>
</style>
