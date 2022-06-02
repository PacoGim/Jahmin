<script lang="ts">
	import { onMount } from 'svelte'
	import { playbackStore } from '../../store/final.store'

	let selectedSongsPreview: HTMLElement

	let selectedSongsIndex: any[] = []
	let selectedSongsElements = []

	let isMouseMove = false
	let isMouseDown = false

	let blockMouseMoveEvent = false

	$: {
		selectedSongsIndex
		buildSelectedSongsPreviewInnerHTML()
	}

	function buildSelectedSongsPreviewInnerHTML() {
		if (selectedSongsPreview === undefined) return

		selectedSongsIndex = selectedSongsIndex.sort((a, b) => Number(a) - Number(b))

		let innerHTML = ''

		selectedSongsIndex.forEach(songIndex => {
			innerHTML += document.querySelector(`playback-song[data-index="${songIndex}"`).innerHTML + '<br>'
		})

		selectedSongsPreview.innerHTML = innerHTML
		selectedSongsPreview.style.opacity = '1'
	}

	function eventClick(evt: MouseEvent) {
		let eventTarget = evt.target as HTMLElement
		let dataSet = eventTarget.dataset
		let songIndex = dataSet.index

		if (evt.metaKey === true || evt.ctrlKey === true) {
			if (selectedSongsIndex.includes(songIndex)) {
				selectedSongsIndex = selectedSongsIndex.filter(index => index !== songIndex)
			} else {
				selectedSongsIndex.push(songIndex)
			}
		} else {
			selectedSongsIndex = [songIndex]
		}

		selectedSongsIndex = selectedSongsIndex
	}

	function eventMouseDown(evt: MouseEvent) {
		isMouseDown = true

		let eventTarget = evt.target as HTMLElement
		let dataSet = eventTarget.dataset
		let songIndex = dataSet.index

		if (!selectedSongsIndex.includes(songIndex)) {
			selectedSongsIndex.push(songIndex)
			selectedSongsIndex = selectedSongsIndex
		}
	}

	function eventMouseUp(evt: MouseEvent) {
		isMouseDown = false
		selectedSongsPreview.style.opacity = '0'
	}

	function eventMouseMove(evt: MouseEvent) {
		if (isMouseDown === true) {
			if (blockMouseMoveEvent) return

			blockMouseMoveEvent = true

			setTimeout(() => {
				blockMouseMoveEvent = false
			}, 1)

			selectedSongsPreview.style.left = evt.x + 10 + 'px'
			selectedSongsPreview.style.top = evt.y + 10 + 'px'
		}
	}

	onMount(() => {
		selectedSongsPreview = document.querySelector('selected-songs-preview')
	})
</script>

<selected-songs-preview />

<playback-layout
	on:mousemove={evt => eventMouseMove(evt)}
	on:mousedown={evt => eventMouseDown(evt)}
	on:mouseup={evt => eventMouseUp(evt)}
>
	{#each $playbackStore as song, index (index)}
		<playback-song
			data-playback-song-id={song.ID}
			data-index={index}
			data-selected={selectedSongsIndex.includes(String(index))}
			on:click={evt => eventClick(evt)}
			on:mouseup={() => (selectedSongsPreview.style.opacity = '0')}
		>
			{song.Track} - {song.Title}
		</playback-song>
	{/each}
</playback-layout>

<style>
	playback-layout {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	playback-song {
		padding: 0.5rem 1rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		cursor: pointer;
	}

	playback-song:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	playback-song[data-selected='true'] {
		background-color: rgba(255, 255, 255, 0.1);
	}

	selected-songs-preview {
		pointer-events: none;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99999;
	}
</style>
