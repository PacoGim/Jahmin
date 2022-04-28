<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import { removeDirectoryIPC, selectDirectoriesIPC } from '../../../services/ipc.service'
	import { directoriesConfig } from '../../../store/config.store'
</script>

<OptionSection title="Directories">
	<directories-section slot="body">
		<p>Select the folders to add to the library, then click import songs</p>

		<br />

		<button
			on:click={() => {
				selectDirectoriesIPC('add')
			}}>Add Directories</button
		>
		<button
			on:click={() => {
				selectDirectoriesIPC('exclude')
			}}>Exclude Directories</button
		>

		<br />

		<button>Import Songs</button>

		{#if $directoriesConfig}
			<h3>Add</h3>

			{#each $directoriesConfig.add as addDir, index (index)}
				<p>{addDir} <button on:click={() => removeDirectoryIPC(addDir, 'remove-add')}>Remove</button></p>
			{/each}

			<h3>Exclude</h3>

			{#each $directoriesConfig.exclude as excludeDir, index (index)}
				<p>{excludeDir} <button on:click={() => removeDirectoryIPC(excludeDir, 'remove-exclude')}>Remove</button></p>
			{/each}
		{/if}
	</directories-section>
</OptionSection>
