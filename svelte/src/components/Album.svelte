<script>
	import { onMount } from 'svelte'
	import { getCover } from '../service/ipc.service'

	export let album
	let imageSrc /* Image Source URL */

	onMount(() => {
		getCover(album['RootDir']).then((result) => {
			console.log(result)
			if (result !== null) {
				imageSrc = result
			}
		})
	})
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
