<script lang="ts">
	import EqualizerButtons from './EqualizerButtons.svelte'
	import EqualizerControls from './EqualizerSliders.svelte'
	import EqualizerProfiles from './EqualizerProfiles.svelte'

	import { currentEqProfile, isEqualizerDirty, isEqualizerOn } from '../../../stores/equalizer.store'

	import OptionSection from '../../../components/OptionSection.svelte'
	import traduceFn from '../../../functions/traduce.fn'
</script>

<OptionSection title="{traduceFn('Equalizer')} {traduceFn('Profiles')}">
	<EqualizerProfiles />
</OptionSection>

<OptionSection title="{traduceFn('Equalizer')} - {$currentEqProfile?.name} {$isEqualizerDirty && $isEqualizerOn ? '•' : ''}">
	<EqualizerControls />
	<EqualizerButtons />
</OptionSection>
