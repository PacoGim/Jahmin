<script lang="ts">
	import { onMount } from 'svelte'

	import { getAlbumIPC, getAlbumsIPC } from '../service/ipc.service'

	import {
		albumListStore,
		playbackCursor,
		playbackStore,
		selectedGroupByStore,
		selectedGroupByValueStore,
		songListStore
	} from '../store/final.store'

	let firstGroupByAssignments = true

	$: {
		if (firstGroupByAssignments === true) {
			firstGroupByAssignments = false
		} else {
			getAlbums($selectedGroupByStore, $selectedGroupByValueStore)
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then((result) => ($albumListStore = result))
	}

	onMount(() => {
		document.addEventListener('click', (evt: MouseEvent) => handleClickEvent(evt))
		document.addEventListener('dblclick', (evt: MouseEvent) => handleClickEvent(evt))
	})

	function handleClickEvent(evt: MouseEvent) {
		//@ts-ignore
		let albumElement: HTMLElement = evt.path.find((path: HTMLElement) => path.tagName === 'ALBUM')

		if (albumElement) {
			getAlbumIPC(albumElement.getAttribute('id')).then((result) => {
				if (evt.type === 'dblclick') {
					$playbackStore = result.Songs
					$playbackCursor = [0, true]
				} else if (evt.type === 'click') {
					$songListStore = result.Songs
				}
			})
		}
	}
</script>
