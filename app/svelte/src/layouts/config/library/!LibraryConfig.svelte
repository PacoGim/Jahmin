<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import traduceFn from '../../../functions/traduce.fn'
	import LibraryFoldersConfig from './LibraryFoldersConfig.svelte'
</script>

<OptionSection title={traduceFn('Library Folders')}>
	<LibraryFoldersConfig />
</OptionSection>

<style>
</style>
