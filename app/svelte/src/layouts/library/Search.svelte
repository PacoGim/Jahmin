<script lang="ts">
	import DeleteIcon from '../../icons/DeleteIcon.svelte'
	import SearchIcon from '../../icons/SearchIcon.svelte'
	import { userSearch } from '../../stores/main.store'

	let inputElement: HTMLInputElement

	function focusInput() {
		inputElement.focus()
	}

	function resetUserSearch() {
		$userSearch = ''
	}
</script>

<search-svlt>
	<icon-container class="search" on:click={focusInput} on:keydown={focusInput} role="button" tabindex="0">
		<SearchIcon style="height: 1rem; stroke: #fff;" />
	</icon-container>
	<input type="text" bind:value={$userSearch} bind:this={inputElement} />
	<icon-container class="delete" on:click={resetUserSearch} on:keydown={resetUserSearch} role="button" tabindex="0">
		<DeleteIcon style="height: 1rem; fill: #fff;" />
	</icon-container>
</search-svlt>

<style>
	search-svlt {
		grid-area: search-svlt;

		display: flex;
		align-items: center;

		margin: 0.5rem;

		filter: grayscale(0.75);

		transition: filter 300ms ease-in-out;
	}

	search-svlt:focus-within,
	search-svlt:hover {
		filter: grayscale(0);
	}

	icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		height: 2rem;
		width: 2rem;
		background-color: #87cefa;
		border-style: solid;
		border-color: #87cefa;

		cursor: pointer;

		transition-property: background-color, border-color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	search-svlt input {
		width: 100%;
		border: none;
		height: 2rem;
		padding: 0.25rem 0.5rem;

		background-color: #f0f8ff;
		border-style: solid;
		border-color: #87cefa;
		border-width: 2px 0 2px 0;

		color: #054d7a;
	}

	icon-container.search {
		border-width: 2px 0 2px 2px;
	}

	icon-container.delete {
		border-width: 2px 2px 2px 0;
	}

	icon-container.delete:hover {
		border-color: var(--color-dangerRed);
		background-color: var(--color-dangerRed);
	}
</style>
