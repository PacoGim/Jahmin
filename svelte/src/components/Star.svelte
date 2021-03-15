<script lang="ts">
	let starLevel = 0
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

<stars>
	<img class="delete-star" src="./img/star/star-delete.svg" alt="" />
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
		opacity: 1;
	}

	img.delete-star {
		opacity: 0;
		margin-right: 2.5px;

		transition-property: opacity filter;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}
	img.delete-star:hover {
		filter: invert(22%) sepia(73%) saturate(4178%) hue-rotate(336deg) brightness(84%) contrast(105%);
	}

	img {
		/* display: inline-block; */
		height: 1rem;
		width: auto;
	}
</style>
