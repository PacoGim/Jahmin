<script lang="ts">
	import EqualizerButtons from './EqualizerButtons.svelte'
	import EqualizerControls from './EqualizerControls.svelte'
	import EqualizerProfiles from './EqualizerProfiles.svelte'

	import { equalizerNameStore, isEqualizerDirty, isEqualizerOn } from '../../../stores/equalizer.store'

	import OptionSection from '../../../components/OptionSection.svelte'
	import traduceFn from '../../../functions/traduce.fn'
</script>

<OptionSection title="{traduceFn('Equalizer')} {traduceFn('Profiles')}">
	<EqualizerProfiles />
</OptionSection>

<OptionSection title="{traduceFn('Equalizer')} - {$equalizerNameStore} {$isEqualizerDirty && $isEqualizerOn ? '•' : ''}">
	<EqualizerControls />
	<EqualizerButtons />
</OptionSection>
