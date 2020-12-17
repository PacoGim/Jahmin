<script>
	import { onMount } from 'svelte'
	import Album from '../components/Album.svelte'

	import { getAlbums } from '../service/ipc.service'

	import { albums, isValuesToFilterChanged } from '../store/index.store'

	onMount(() => {
		// Calls the IPC once to wait for the filtering to be done.
		getAlbums()

		// Whenever a filter is selected resest the scroll to top.
		isValuesToFilterChanged.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})
	})
</script>

<art-grid-svlt>
	{#each $albums as album, index (album['ID'])}
		<Album {album} {index} />
	{/each}
</art-grid-svlt>

<style>
	art-grid-svlt {
		border: 10px transparent solid;
		overflow-y: auto;
		height: 100%;
		grid-area: art-grid-svlt;
		background-color: #222;
		display: grid;
		grid-template-columns: repeat(auto-fit, 128px);
		grid-template-rows: repeat(auto-fit, 128px);
		gap: 10px;
	}
</style>
