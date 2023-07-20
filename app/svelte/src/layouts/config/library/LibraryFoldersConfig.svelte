<script lang="ts">
	import OptionSectionCompact from '../../../components/OptionSectionCompact.svelte'
	import traduceFn from '../../../functions/traduce.fn'
	import AddIcon from '../../../icons/AddIcon.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'
	import { config } from '../../../stores/config.store'
	import { layoutToShow } from '../../../stores/main.store'
</script>

<OptionSectionCompact title={traduceFn('Is the library missing songs?')}>
	<button
		on:click={() => {
			// TODO Migrate to new db
			// getAllSongsFn().then(songs => {
			// 	window.ipc.sendAllSongsToMain(songs)
			// 	$layoutToShow = 'Library'
			// })
		}}>{traduceFn('Reload the library')}</button
	>
</OptionSectionCompact>

<add-folder-config class="section-main">
	<section-title>{traduceFn('Add Folder to Library')}</section-title>
	<section-body>
		{#if $config.directories}
			{#each $config.directories.add || [] as directory, index (index)}
				<section-directory>
					<directory-path>{directory}</directory-path>
					<!-- TODO Migrate to new db -->
					<!-- <button on:click={async () => window.ipc.removeDirectory(directory, 'remove-add', await getAllSongsFn())}> -->
						<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
						{traduceFn('Remove')}
					<!-- </button> -->
				</section-directory>
			{/each}
		{/if}
	</section-body>
	<button
		on:click={async () => {
			// TODO Migrate to new db
			// window.ipc.selectDirectories('add', await getAllSongsFn())
		}}
	>
		<AddIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{traduceFn('Add Directories')}
	</button>
</add-folder-config>

<exclude-folder-config class="section-main">
	<section-title>{traduceFn('Exclude Folder from Library')}</section-title>
	<section-body>
		{#if $config.directories}
			{#each $config.directories.exclude || [] as directory, index (index)}
				<section-directory>
					<directory-path>{directory}</directory-path>
					<!--TODO Migrate to new db <button
						class="danger"
						on:click={async () => window.ipc.removeDirectory(directory, 'remove-exclude', await getAllSongsFn())}
					> -->
						<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
						{traduceFn('Remove')}
					<!-- </button> -->
				</section-directory>
			{/each}
		{/if}
	</section-body>
	<button
		class="info"
		on:click={async () => {
			// TODO Migrate to new db
			// window.ipc.selectDirectories('exclude', await getAllSongsFn())
		}}
	>
		<AddIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{traduceFn('Exclude Directories')}
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

		background-color: var(--color-bg-2);
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

		max-height: 14rem;
		min-height: 14rem;

		min-width: 75%;
		max-width: 75%;

		overflow-y: auto;

		padding: 0.5rem;

		background-color: var(--color-bg-3);
	}

	section-directory {
		display: grid;
		grid-template-columns: auto max-content;
		align-items: center;
		padding: 0.5rem 1rem;

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	section-directory:hover {
		background-color: var(--color-bg-1);
	}

	section-directory directory-path {
		margin-right: 1rem;
	}
</style>
