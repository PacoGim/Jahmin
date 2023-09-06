<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import traduceFn from '../../../functions/traduce.fn'
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import ToggleIcon from '../../../icons/ToggleIcon.svelte'
	import { configStore, pauseAnimatedArtWhenAppUnfocusedConfig } from '../../../stores/config.store'
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
	<OptionSectionCompact title={'Language'}>
		<LanguageConfig />
	</OptionSectionCompact>

	<OptionSection title={'Day | Night Mode'}>
		<DayNightThemeConfig />
	</OptionSection>

	<OptionSection title={'Color Contrast Ratio'}>
		<ColorContrastConfig />
	</OptionSection>

	<OptionSection title={'Other Options'}>
		<OptionSectionCompact title={traduceFn('Font Size : ${fontSize}', { fontSize: $configStore.userOptions.fontSize })}>
			<FontSizeConfig />
		</OptionSectionCompact>

		<OptionSectionCompact title={traduceFn('Grid Art Size : ${artSize}', { artSize: $configStore.userOptions.artSize })}>
			<GridArtSize />
		</OptionSectionCompact>

		<OptionSectionCompact title={traduceFn('Grid Art Gap : ${gridGap}', { gridGap: $configStore.userOptions.gridGap })}>
			<GridGapSize />
		</OptionSectionCompact>

		<OptionSectionCompact title={traduceFn('Clean Art Cache')}>
			<RebuildArtCacheConfig />
		</OptionSectionCompact>

		<OptionSectionCompact>
			<AlwaysShowAlbumOverlay />
		</OptionSectionCompact>

		<OptionSectionCompact>
			<button
				on:click={() => {
					updateConfigFn({
						userOptions: {
							pauseAnimatedArtWhenAppUnfocused: !$pauseAnimatedArtWhenAppUnfocusedConfig
						}
					})
				}}
			>
				{traduceFn('Pause animated art when app is unfocused')}
				<ToggleIcon toggle={$pauseAnimatedArtWhenAppUnfocusedConfig === true ? 'on' : 'off'} />
			</button>
		</OptionSectionCompact>
	</OptionSection>
</config-section>

<style>
</style>
