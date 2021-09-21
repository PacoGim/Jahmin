<script lang="ts">
import CogIcon from '../../icons/CogIcon.svelte';
import HomeIcon from '../../icons/HomeIcon.svelte';
import SearchIcon from '../../icons/SearchIcon.svelte';

	import { layoutToShow } from '../../store/final.store'
</script>

<navigation-svlt class="dark-theme">
	<nav-button on:click={() => ($layoutToShow = 'Main')}>
		<HomeIcon isActive={$layoutToShow === 'Main'}/>
	</nav-button>
	<nav-button on:click={() => ($layoutToShow = 'Search')}>
		<SearchIcon isActive={$layoutToShow === 'Search'}/>
	</nav-button>
	<separator />
	<nav-button class="configButton" on:click={() => ($layoutToShow = 'Config')}>
		<CogIcon isActive={$layoutToShow === 'Config'}/>
	</nav-button>
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		grid-template-rows: repeat(2, max-content) auto max-content;

		background-color: rgba(255, 255, 255, 0.025);
	}

	nav-button {
		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 7px;

		cursor: pointer;
		margin: 0.5rem;
		margin-bottom: 0.25rem;
		background-color: rgba(255, 255, 255, 0.1);
	}

	nav-button.configButton {
		margin-bottom: 0.5rem;
		/* margin: none; */
	}
</style>
