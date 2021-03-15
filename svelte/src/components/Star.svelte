<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let songRating = 0

	let starLevel = songRating / 10
	let starLevelTemp = starLevel
	let starElementWidth: number = undefined

	function setStarLevel(e: MouseEvent) {
		if (!starElementWidth) {
			starElementWidth = document.querySelector('img.star').scrollWidth
		}

		let starValue = Math.trunc(((100 / starElementWidth) * e.offsetX) / (100 / 10)) + 1

		if (starValue < 1) {
			starValue = 1
		} else if (starValue > 10) {
			starValue = 10
		}

		starLevel = starValue
	}
</script>

<stars on:click={dispatch('starChange', { starLevel: starLevel * 10 })}>
	<img
		on:click={() => {
			starLevel = 0
			starLevelTemp = 0
		}}
		class="delete-star"
		src="./img/star/star-delete.svg"
		alt=""
	/>
	<!--
		MouseMove -> As the user moves through the stars, sets the proper star level.
		MouseClick -> If the user clicks a star level, saves it in a temporary star level.
		MouseLeave -> When the user leaves, sets the star level with the value of the temporary star level.
	 -->
	<img
		class="star"
		on:mouseleave={() => (starLevel = starLevelTemp)}
		on:click={() => (starLevelTemp = starLevel)}
		on:mousemove={(e) => setStarLevel(e)}
		src="./img/star/star-{starLevel}.svg"
		alt=""
	/>
</stars>

<style>
	stars {
		display: flex;
	}

	stars:hover img.delete-star {
		opacity: 0.5;
	}

	img.delete-star {
		opacity: 0;
		margin-right: 2.5px;

		transition-property: opacity;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	img.delete-star:hover {
		opacity: 1 !important;
	}

	img {
		height: 1rem;
		width: auto;
	}
</style>
