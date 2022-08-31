<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import isValidPathFn from '../../functions/isValidPath.fn'
	import { songListStore } from '../../stores/main.store'

	const dispatch = createEventDispatcher()

	let isMouseDownInScroll = false

	// Improves detection by reducing the amount of times the mousemove event is triggered and dispatches and event.
	let previousScrollAmountDispatched = 0

	function scrollBarHandler() {
		let songListScrollBar: HTMLDivElement = document.querySelector('song-list-scroll-bar')

		// Handles moving the cursor over the "scrollbar" then moving out of it so the "scrolling" does not stop abruptly.
		document.addEventListener('mousemove', (e: MouseEvent) => {
			// Checks if the other event triggered a mouse down on the "scrollbar".
			if (isMouseDownInScroll) {
				// Returns the position (top and height) on screen of the "scrollbar".
				let { top, height } = songListScrollBar.getBoundingClientRect()

				// Calculates the difference between the current cursor position on screen relative to the "scrollbar".
				let difference = e.clientY - top

				// Calculates the percentage of scroll.
				// 0% and lower would mean that the cursor is at the top and beyond the scrollbar.
				// 100% and above would mean that the cursor is at the bottom and beyond the scrollbar.
				let percentage = (100 / height) * difference

				// If the percent is higher than 100% block the percent to 100%.
				if (percentage >= 100) {
					percentage = 100
					// If the percent is lower than 0% block the percent to 0%.
				} else if (percentage <= 0) {
					percentage = 0
				}

				// Sets the scrollAmount value with the newly calculated one.
				dispatchScrollAmount((($songListStore.length - 1) / 100) * percentage)
			}
		})

		// If the user clicks on either the scroll bar or the progress fill, set isMouseDownInScroll to true.
		document.addEventListener('mousedown', e => {
			if (isValidPathFn(e, ['SONG-LIST-SCROLL-BAR', 'SCROLLBAR-FILL'])) {
				isMouseDownInScroll = true
			}
		})

		// Anywhere the user releases the mouse button, sets isMouseDownInScroll to false.
		document.addEventListener('mouseup', () => {
			isMouseDownInScroll = false
		})

		// If the user click on the scrollbar, calls setScrollAmountBar.
		songListScrollBar.addEventListener('click', evt => setScrollAmountBar(songListScrollBar, evt))
	}

	// Sets the proper scrollAmount based of the percentage (in distance) of the bar clicked. 0% = top and 100% = bottom.
	function setScrollAmountBar(songListScrollBar: HTMLDivElement, e: MouseEvent) {
		let percentClick = (100 / songListScrollBar.clientHeight) * e.offsetY

		dispatchScrollAmount(($songListStore.length / 100) * percentClick)
	}

	function dispatchScrollAmount(scrollAmount: number) {
		scrollAmount = Math.trunc(scrollAmount)

		if (scrollAmount !== previousScrollAmountDispatched) {
			dispatch('songListBarScrolled', scrollAmount)
			previousScrollAmountDispatched = scrollAmount
		}
	}

	onMount(() => {
		scrollBarHandler()
	})
</script>

<song-list-scroll-bar>
	<scrollbar-fill />
</song-list-scroll-bar>

<style>
	song-list-scroll-bar {
		display: block;
		width: 1rem;
		background-color: rgba(255, 255, 255, 0.15);

		cursor: grab;
	}
	song-list-scroll-bar:active {
		cursor: grabbing;
	}

	song-list-scroll-bar scrollbar-fill {
		display: block;
		width: auto;
		/* background-color: var(--art-color-light); */
		background-color: rgba(255, 255, 255, 0.5);
		height: var(--scrollbar-fill);
		border-bottom: 5px solid rgba(255, 255, 255, 0.75);
		/* border-bottom: 5px solid var(--art-color-dark); */
		max-height: 100%;
	}
</style>
