<script lang="ts">
	import EqualizerButtons from './EqualizerButtons.svelte'
	import EqualizerControls from './EqualizerControls.svelte'
	import EqualizerProfiles from './EqualizerProfiles.svelte'

	import { equalizerNameStore, isEqualizerDirty, isEqualizerOn } from '../../../stores/equalizer.store'

	import OptionSection from '../../../components/OptionSection.svelte'
</script>

<OptionSection title="Equalizer Profiles">
	<EqualizerProfiles />
</OptionSection>

<OptionSection title="Equalizer - {$equalizerNameStore} {$isEqualizerDirty && $isEqualizerOn ? '•' : ''}">
	<EqualizerControls />
	<EqualizerButtons />
</OptionSection>
