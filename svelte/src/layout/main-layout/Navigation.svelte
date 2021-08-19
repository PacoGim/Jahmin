<script>
	import { showConfigLayout } from '../../store/final.store'
</script>

<navigation-svlt>
	<img id="configButton" on:click={() => ($showConfigLayout = !$showConfigLayout)} src="./img/cog.svg" alt="" />
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: flex;

		background-color: rgba(255, 255, 255, 0.025);
	}

	img#configButton {
		cursor: pointer;
		padding: 0.5rem;
		filter: invert(98%) sepia(99%) saturate(124%) hue-rotate(324deg) brightness(95%) contrast(93%);
		width: 100%;
		align-self: flex-end;
	}
</style>
