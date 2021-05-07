<script lang="ts">
	import Navigation from './includes/Navigation.svelte'
	import ArtGrid from './includes/ArtGrid.svelte'
	import Grouping from './includes/Grouping.svelte'
	import Player from './includes/Player.svelte'
	import SongList from './includes/SongList.svelte'
	import TagEdit from './includes/TagEdit.svelte'

	import ConfigController from './controllers/ConfigController.svelte'
	import PlayerController from './controllers/PlayerController.svelte'

	import BackgroundArt from './includes/BackgroundArt.svelte'
	import SongListBackground from './includes/SongListBackground.svelte'
	import { onMount } from 'svelte'
	import { getChangesProgressIPC, showContextMenuIPC, syncDbVersionIPC } from './service/ipc.service'
	import { albumListStore, appTitle } from './store/final.store'

	onMount(() => {
		syncDbVersionIPC()

		// getNewDbChangesProgress()

		window.onkeydown = function (e) {
			return !(e.code == 'Space' && e.target == document.body)
		}

		window.addEventListener('contextmenu', (e: MouseEvent) => {
			e.preventDefault()

			const pathsName = e.composedPath().map((path: HTMLElement) => path.tagName)

			if (pathsName.includes('ALBUM')) {
				let albumElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'ALBUM') as HTMLElement

				let albumId = albumElement.getAttribute('id')

				showContextMenuIPC(
					'AlbumContextMenu',
					JSON.stringify({
						albumId
					})
				)
			}
		})

		// window.onclick = (evt: MouseEvent) => {
		// 	let songListSvelteFound = false

		// 	evt['path'].forEach((element: HTMLElement) => {
		// 		if (element.tagName === 'SONG-LIST-SVLT') {
		// 			songListSvelteFound = true
		// 		}
		// 	})

		// 	if (songListSvelteFound === false) {
		// 		$selectedSongs = []
		// 		songListSvelteFound = false
		// 	}
		// }
	})

	function getNewDbChangesProgress() {
		getChangesProgressIPC().then((result) => {
			console.log(result.total, result.current, (100 / result.total) * result.current || 0, '%')

			setTimeout(() => {
				getNewDbChangesProgress()
			}, 10000)
		})
	}
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<PlayerController />
<ConfigController />

<main>
	<Navigation />
	<ArtGrid />
	<Grouping />
	<Player />
	<SongList />
	<TagEdit />
	<BackgroundArt />
	<SongListBackground />
</main>

<style>
	main {
		height: 100%;
		overflow-y: hidden;
		display: grid;
		grid-template-columns: 64px auto 8fr 256px;
		/* grid-template-rows: 2fr minmax(auto, var(--song-list-svlt-height)) 64px; */
		grid-template-rows: 2fr minmax(auto, var(--song-list-svlt-height)) 64px;
		grid-template-areas:
			'navigation-svlt grouping-svlt art-grid-svlt tag-edit-svlt'
			'navigation-svlt grouping-svlt song-list-svlt tag-edit-svlt'
			'navigation-svlt grouping-svlt player-svlt tag-edit-svlt';
	}
</style>
