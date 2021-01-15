<script lang="ts">
	import { onMount } from 'svelte'
	import { getCover } from '../service/ipc.service'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import { playbackIndex, selectedAlbum } from '../store/player.store'
	import type { AlbumType } from '../types/album.type'

	export let album: AlbumType
	export let index
	let coverType = undefined
	let coverSrc = undefined /* Image Source URL */

	onMount(() => {
		addIntersectionObserver()

		let lastPlayedAlbumID = localStorage.getItem('LastPlayedAlbumID')

		if (album['ID'] === lastPlayedAlbumID) {
			prepareAlbum(undefined)
		}
	})

	function fetchAlbumCover() {
		getCover(album['RootDir']).then((result) => {
			if (result !== null) {
				coverSrc = result['filePath']
				coverType = result['fileType']
			} else {
				coverType = 'not found'
			}
		})
	}

	function addIntersectionObserver() {
		new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true && coverSrc === undefined) {
					fetchAlbumCover()
				}
			},
			{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '0px 0px 50% 0px' }
		).observe(document.querySelector(`art-grid-svlt > album:nth-child(${index + 1})`))
	}

	async function prepareAlbum(evt: MouseEvent | undefined) {
		album['Songs'] = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		$selectedAlbum = album

		if (evt !== undefined && evt['type'] === 'dblclick') {
			setNewPlayback(album['ID'], 0)
		} else {
			let lastPlayedSong = album['Songs'].find((i) => i['$loki'] === Number(localStorage.getItem('LastPlayedSongID')))

			if (lastPlayedSong) {
				let lastPlayedSongID = lastPlayedSong['$loki']

				if (lastPlayedSongID) {
					setTimeout(() => {
						document.querySelector(`#${CSS.escape(String(lastPlayedSongID))}`).scrollIntoView({ behavior: 'smooth' })
						$playbackIndex = {
							indexToPlay: album['Songs'].findIndex((i) => i['$loki'] === lastPlayedSongID),
							playNow: false
						}

						// console.log($playbackIndex)
					}, 100)
				}
			}
		}

		// document.querySelector('song-list-svlt').scrollTop = 0
	}
</script>

<album id={album['ID']} on:dblclick={(evt) => prepareAlbum(evt)} on:click={(evt) => prepareAlbum(evt)}>
	{#if coverType === undefined}<img src="./img/audio.svg" class="loader" alt="" />{/if}
	{#if coverType === 'not found'}<img src="./img/compact-disc.svg" class="notFound" alt="" />{/if}
	{#if coverType === 'image'}<img src={coverSrc} alt={album['Name']} />{/if}
	{#if coverType === 'video'}
		<video autoplay loop>
			<track kind="captions" />
			<source src={coverSrc} />
		</video>
	{/if}

	<img src="./img/gradient-overlay.svg" alt="" />

	<album-details>
		<album-name>{album['Name']}</album-name>

		{#if album['AlbumArtist'] === undefined}
			<album-artist>{album['AlbumArtist']}</album-artist>
		{:else}
			<album-artist>{album['DynamicAlbumArtist']}</album-artist>
		{/if}
	</album-details>
</album>

<style>
	album:last-of-type {
		/* padding-bottom: 20px; */
	}

	album {
		position: relative;
		display: grid;

		margin: 1rem;
		/* justify-content: center;
		align-items: center;
		flex-direction: column; */
		cursor: pointer;
		height: var(--cover-dimension);
		width: var(--cover-dimension);
		max-width: var(--cover-dimension);
		max-height: var(--cover-dimension);
	}

	album-details {
		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		align-self: end;
		text-align: center;
	}

	album > * {
		grid-column: 1;
		grid-row: 1;
	}

	album-artist {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: calc(var(--cover-dimension) - 1.5rem);
	}

	album-name {
		font-variation-settings: 'wght' 700;
		white-space: normal;
	}

	video {
		height: var(--cover-dimension);
		width: var(--cover-dimension);
	}

	img {
		height: var(--cover-dimension);
		width: var(--cover-dimension);
	}

	img.loader {
		padding: 5rem;
		/* height: 32px;
		width: 32px; */
	}

	img.notFound {
		border-width: 10px;
		border-color: #fff #ccc #ccc #fff;
		border-style: solid;
		padding: 2rem;
	}
</style>
