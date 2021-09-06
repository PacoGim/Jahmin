<script lang="ts">
	import { layoutToShow } from '../../store/final.store'
</script>

<navigation-svlt class="dark-theme">
	<nav-button on:click={() => ($layoutToShow = 'Main')}>
		<img src="./img/home.svg" alt="" />
	</nav-button>
	<nav-button on:click={() => ($layoutToShow = 'Search')}>
		<img src="./img/search.svg" alt="" />
	</nav-button>
	<separator />
	<nav-button class="configButton" on:click={() => ($layoutToShow = 'Config')}>
		<img src="./img/cog.svg" alt="" />
	</nav-button>
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		grid-template-rows: repeat(2, max-content) auto max-content;

		background-color: rgba(255, 255, 255, 0.025);
	}

	navigation-svlt.dark-theme nav-button img {
		filter: invert(98%) sepia(99%) saturate(124%) hue-rotate(324deg) brightness(95%) contrast(93%)
			drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.25));
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

	nav-button img {
		padding: 0.5rem;
		-webkit-user-drag: none;
		height: 48px;
		width: 48px;
	}

	nav-button.configButton {
		margin-bottom: 0.5rem;
		/* margin: none; */
	}
</style>
