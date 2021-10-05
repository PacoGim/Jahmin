<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let songRating = 0
	export let hook
	export let klass: '' | 'tag-edit-star' = ''
	export let showUndo = false

	let starRating = 0
	let starRatingTemp = 0 // Keeps track of the user selected rating.
	let starElementWidth: number = undefined

	$: convertRating(songRating)

	function convertRating(fnSongRating: number) {
		// Converts 0-100 Rating to 0-10
		if (fnSongRating && fnSongRating !== 0) {
			starRating = fnSongRating / 10
		} else {
			starRating = 0
		}

		starRatingTemp = starRating
	}

	function setStarRating(e: MouseEvent) {
		if (!starElementWidth) {
			starElementWidth = document.querySelector(`${hook} img.star`).scrollWidth
		}

		// Gets a value from 0 to 10 based on the percentage of the cursor position on star element.
		let starValue = Math.trunc(((100 / starElementWidth) * e.offsetX) / (100 / 10)) + 1

		if (starValue <= 1) {
			starValue = 1
		} else if (starValue >= 10) {
			starValue = 10
		}

		starRating = starValue
	}
</script>

<stars on:click={dispatch('starChange', { starRating: starRating * 10 })} class={klass}>
	<img
		on:click={() => {
			starRating = 0
			starRatingTemp = 0
		}}
		class="delete-star {klass}"
		src="./img/star/star-delete.svg"
		alt=""
	/>
	<!--
			MouseMove -> As the user moves through the stars, sets the proper star rating and images.
			MouseClick -> If the user clicks a star rating, saves it in a temporary star rating.
			MouseLeave -> When the user leaves, sets the star rating with the value of the temporary star rating.
		-->
	<img
		class="star {klass}"
		on:mouseleave={() => (starRating = starRatingTemp)}
		on:click={() => (starRatingTemp = starRating)}
		on:mousemove={e => setStarRating(e)}
		src="./img/star/star-{starRating}.svg"
		alt=""
	/>
</stars>

<button
	class="{klass} {showUndo ? 'show-undo' : ''}"
	on:click={() => {
		starRatingTemp = 0
		dispatch('undoChange')
	}}>Undo Rating <img class="undoIcon" src="./img/undo-arrow-svgrepo-com.svg" alt="" /></button
>

<style>
	stars {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	button {
		margin: 0 auto;
		width: fit-content;
		opacity: 0;
		display: none;

		transition: opacity 100ms linear;
	}

	button.show-undo {
		opacity: 1;
	}
	button.tag-edit-star {
		display: block;
	}

	stars:hover img.delete-star {
		opacity: 0.5;
	}

	stars.tag-edit-star {
		margin: 0 auto 0.5rem auto;
	}

	img.tag-edit-star {
		height: 2rem;
	}
	img.tag-edit-star.delete-star {
		opacity: 0.5;
		height: 1.8rem;
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
