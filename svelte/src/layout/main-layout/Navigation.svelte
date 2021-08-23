<script lang="ts">
	import { layoutToShow } from '../../store/final.store'
</script>

<navigation-svlt>
	<img class="navButton" on:click={() => ($layoutToShow = 'Main')} src="./img/home.svg" alt="" />
	<img class="navButton" on:click={() => ($layoutToShow = 'Search')} src="./img/search.svg" alt="" />
	<separator />
	<img class="navButton configButton" on:click={() => ($layoutToShow = 'Config')} src="./img/cog.svg" alt="" />
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		/* grid-template-columns: auto; */
		grid-template-rows: repeat(2,max-content) auto max-content;

		background-color: rgba(255, 255, 255, 0.025);
	}

	img.navButton {
		display: block;
		cursor: pointer;
		padding: 0.5rem;
		filter: invert(98%) sepia(99%) saturate(124%) hue-rotate(324deg) brightness(95%) contrast(93%);
		width: 100%;

		-webkit-user-drag: none;
	}

	img.configButton {

	}
</style>
