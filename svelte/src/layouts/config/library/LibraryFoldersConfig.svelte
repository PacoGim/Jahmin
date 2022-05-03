<script lang="ts">
	import AddIcon from '../../../icons/AddIcon.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'

	import { removeDirectoryIPC, selectDirectoriesIPC } from '../../../services/ipc.service'
	import { directoriesConfig } from '../../../store/config.store'
</script>

<add-folder-config class="section-main">
	<section-title> Add Folder to Library </section-title>
	<section-body>
		{#if $directoriesConfig}
			{#each $directoriesConfig.add || [] as directory, index (index)}
				<section-directory>
					<directory-path>{directory}</directory-path>
					<button class="danger" on:click={() => removeDirectoryIPC(directory, 'remove-add')}>
						<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
						Remove
					</button>
				</section-directory>
			{/each}
		{/if}
	</section-body>
	<button
		class="info"
		on:click={() => {
			selectDirectoriesIPC('add')
		}}
	>
		<AddIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Add Directories
	</button>
</add-folder-config>

<exclude-folder-config class="section-main">
	<section-title>Exclude Folder from Library</section-title>
	<section-body>
		{#if $directoriesConfig}
			{#each $directoriesConfig.exclude || [] as directory, index (index)}
				<section-directory>
					<directory-path>{directory}</directory-path>
					<button class="danger" on:click={() => removeDirectoryIPC(directory, 'remove-exclude')}>
						<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
						Remove
					</button>
				</section-directory>
			{/each}
		{/if}
	</section-body>
	<button
		class="info"
		on:click={() => {
			selectDirectoriesIPC('exclude')
		}}
	>
		<AddIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Exclude Directories
	</button>
</exclude-folder-config>

<style>
	*.section-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		padding: 1rem;
	}

	exclude-folder-config {
		border-top: 1px solid #fff;
	}

	section-title {
		display: block;
		font-size: 1.05rem;
		margin-bottom: 1rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 150);
	}

	section-body {
		display: block;
		margin-bottom: 1rem;
	}

	section-directory {
		display: grid;
		grid-template-columns: auto max-content;
		align-items: center;
		padding: 0.5rem;
	}

	section-directory directory-path {
		margin-right: 1rem;
	}
</style>
