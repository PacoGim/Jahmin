<script lang="ts">
	import { onMount } from 'svelte'
	import { getCover } from '../service/ipc.service'
	import { setNewPlaylist } from '../service/setNewPlaylist.fn'
	import { selectedAlbum } from '../store/player.store'
	import type { AlbumType } from '../types/album.type'

	export let album: AlbumType
	export let index
	let coverType = undefined
	let coverSrc = undefined /* Image Source URL */

	// var observer =body > main > art-grid-svlt > album:nth-child(32) > img
	// body > main > art-grid-svlt > album:nth-child(1)
	// observer.observe(document.querySelector('#main-container'))

	onMount(() => {
		addIntersectionObserver()
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

	async function prepareAlbum(evt: MouseEvent) {
		album['Songs'] = album['Songs'].sort((a, b) => a['Track'] - b['Track'])
		$selectedAlbum = album

		if (evt['type'] === 'dblclick') {
			setNewPlaylist(album['ID'], 0)
		}

		document.querySelector('song-list-svlt').scrollTop = 0
	}
</script>

<album id={album['ID']} on:dblclick={(evt) => prepareAlbum(evt)} on:click={(evt) => prepareAlbum(evt)}>
	{#if coverType === undefined}<img src="./img/audio.svg" class="loader" alt="" />{/if}
	{#if coverType === 'not found'}<img src="./img/compact-disc.svg" class="notFound" alt="" />{/if}
	{#if coverType === 'image'}<img src={coverSrc} alt={album['Album']} />{/if}
	{#if coverType === 'video'}
		<video autoplay loop>
			<track kind="captions" />
			<source src={coverSrc} />
		</video>
	{/if}
	<album-name>{album['Album']}</album-name>

	{#if album['AlbumArtist'] === undefined}
		<album-artist>{album['AlbumArtist']}</album-artist>
	{:else}
		<album-artist>{album['DynamicAlbumArtist']}</album-artist>
	{/if}
</album>

<style>
	album:last-of-type {
		/* padding-bottom: 20px; */
	}

	album {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		cursor: pointer;
	}

	album-artist,
	album-name {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: var(--cover-dimension);
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
