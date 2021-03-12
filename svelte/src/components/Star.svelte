<script lang="ts">
	let starLevel = 0
	let starLevelTemp = starLevel

	let starElementWidth: number = undefined

	function foo(e: MouseEvent) {
		if (!starElementWidth) {
			starElementWidth = document.querySelector('img.star').scrollWidth
		}

		let foobar = Math.trunc(((100 / starElementWidth) * e.offsetX) / (100 / 12))

		if (foobar === 0) {
			foobar = 1
		}

		if (foobar > 11) {
			foobar = 11
		}

		if (foobar === 0 || foobar === 1) {
			starLevel = 'delete'
		} else {
			starLevel = foobar - 1
		}
	}
</script>

<img
	class="star"
	on:mouseleave={() => (starLevel = starLevelTemp)}
	on:click={() => (starLevelTemp = starLevel)}
	on:mousemove={(e) => foo(e)}
	src="./img/star/star-{starLevel}.svg"
	alt=""
/>

<style>
	img {
		display: block;
		height: 1rem;
		width: auto;
	}
</style>
