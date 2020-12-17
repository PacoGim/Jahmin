<script>
	import { onMount } from 'svelte'
	import { getCover } from '../service/ipc.service'

	export let album
	export let index
	let imageSrc = undefined /* Image Source URL */

	// var observer =body > main > art-grid-svlt > album:nth-child(32) > img
	// body > main > art-grid-svlt > album:nth-child(1)
	// observer.observe(document.querySelector('#main-container'))

	onMount(() => {
		addIntersectionObserver()
	})

	function fetchAlbumCover() {
		getCover(album['RootDir']).then((result) => {
			if (result !== null) {
				imageSrc = result
			} else {
				console.log('Got null')
			}
		})
	}

	function addIntersectionObserver() {
		new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true && imageSrc === undefined) {
					fetchAlbumCover()
				}
			},
			{ threshold: 0 }
		).observe(document.querySelector(`art-grid-svlt > album:nth-child(${index + 1})`))
	}
</script>

<album><img src={imageSrc} alt="" /></album>

<style>
	album:last-of-type {
		/* padding-bottom: 20px; */
	}

	album {
		height: 128px;
		width: 128px;
	}

	img {
		height: 100%;
		width: 100%;
	}
</style>
