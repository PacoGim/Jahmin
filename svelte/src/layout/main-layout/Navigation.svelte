<script lang="ts">
	import CogIcon from '../../icons/CogIcon.svelte'
	import HomeIcon from '../../icons/HomeIcon.svelte'
	import SearchIcon from '../../icons/SearchIcon.svelte'

	import { layoutToShow } from '../../store/final.store'
</script>

<navigation-svlt class="dark-theme">
	<nav-button on:click={() => ($layoutToShow = 'Main')}>
		<HomeIcon isActive={$layoutToShow === 'Main'} />
	</nav-button>
	<nav-button on:click={() => ($layoutToShow = 'Search')}>
		<SearchIcon isActive={$layoutToShow === 'Search'} />
	</nav-button>
	<separator />
	<nav-button class="configButton" on:click={() => ($layoutToShow = 'Config')}>
		<CogIcon isActive={$layoutToShow === 'Config'} />
	</nav-button>
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		grid-template-rows: repeat(2, max-content) auto max-content;

		background-color: var(--color-bg-1);
		border-right: 2px var(--color-bg-2) solid;

		transition-property: background-color border-right;
		transition-duration: var(--theme-transition-duration);
		transition-timing-function: linear;
	}

	nav-button {
		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 7px;

		cursor: pointer;
		margin: 0.5rem;
		margin-bottom: 0.25rem;
		background-color: var(--color-bg-2);

		transition-property: background-color;
		transition-duration: var(--theme-transition-duration);
		transition-timing-function: linear;
	}

	nav-button.configButton {
		margin-bottom: 0.5rem;
		/* margin: none; */
	}
</style>
