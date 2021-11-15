<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'

	import { selectedEqId, isEqualizerDirty, isEqualizerOn } from '../../../store/equalizer.store'

	import EqualizerProfilesSection from '../option-sections/EqualizerProfilesSection.svelte'
	import EqualizerSection from '../option-sections/EqualizerSection.svelte'
	import EqualizerButtonsSection from '../option-sections/EqualizerButtonsSection.svelte'
	import { equalizerService } from '../../../store/service.store'

	let equalizerName = ''

	$: equalizerName = getProfileNameFromId($selectedEqId)

	function getProfileNameFromId(eqId: String) {
		if ($equalizerService !== undefined) {
			return $equalizerService.getEqualizerName(eqId)
		} else {
			return ''
		}
	}
</script>

<OptionSection title="Equalizer Profiles">
	<EqualizerProfilesSection slot="body" />
</OptionSection>

<OptionSection title="Equalizer - {equalizerName} {$isEqualizerDirty && $isEqualizerOn ? '•' : ''}">
	<EqualizerSection slot="body" />
</OptionSection>

<OptionSection title="">
	<EqualizerButtonsSection slot="body" />
</OptionSection>
