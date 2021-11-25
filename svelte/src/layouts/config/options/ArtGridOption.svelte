<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
</script>

<OptionSection title="Art Size">
	<art-grid-size slot="body">
		<button>Set Art Size</button>
	</art-grid-size>
</OptionSection>

<OptionSection title="Art Grid Gap">
	<art-grid-size slot="body">
		<button>Set Grid Gap</button>
	</art-grid-size>
</OptionSection>

<style>
	art-grid-size {
		display: flex;
		justify-content: center;
		width: 100%;
	}
</style>
