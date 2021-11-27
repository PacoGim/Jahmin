<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import { getArtIPC } from '../services/ipc.service'
	import { albumArtMapStore } from '../store/final.store'
	import type { AlbumArtType } from '../types/albumArt.type'

	let artType = undefined
	let artSrc = undefined

	export let klass
	export let rootDir
	export let type: 'forceLoad' | 'observe' | null = null
	export let showPlaceholder = true
	export let style

	let albumArtVersion = undefined

	$: {
		forceArtSource(rootDir)
	}

	$: {
		let albumId = hash(rootDir, 'text')
		const ALBUM_ART_DATA = $albumArtMapStore.get(albumId)
		if (ALBUM_ART_DATA?.version !== albumArtVersion) {
			setArtSource(ALBUM_ART_DATA)
		}
	}

	onMount(() => {
		if (type === 'observe') {
			addIntersectionObserver(rootDir).then((result: any) => {
				if (result.status === 'art-not-found') {
					getAlbumArt(rootDir)
				} else if (result.status === 'art-found') {
					setArtSource(result.data)
				}
			})
		} else if (type === 'forceLoad') {
			getAlbumArt(rootDir)
		}
	})

	function forceArtSource(rootDir: string) {
		let albumId = hash(rootDir, 'text')
		const ALBUM_ART_DATA = $albumArtMapStore.get(albumId)

		setArtSource(ALBUM_ART_DATA)
	}

	function setArtSource(artData: AlbumArtType) {
		if (artData) {
			albumArtVersion = artData.version
			artType = artData.fileType
			artSrc = `${artData.filePath}#${artData.version}`
		}
	}

	function getAlbumArt(rootDir: 'string') {
		getArtIPC(rootDir).then((response: AlbumArtType) => {
			let albumId = hash(rootDir, 'text')
			if (response) {
				$albumArtMapStore.set(albumId, {
					version: 0,
					filePath: response.filePath,
					fileType: response.fileType
				})

				$albumArtMapStore = $albumArtMapStore
			} else {
				artType = 'not found'
				artSrc = './img/compact-disc.svg'
			}
		})
	}
</script>

<art-art data-loaded={artSrc === undefined ? 'false' : 'true'} {style}>
	{#if artType === undefined && showPlaceholder === true}
		<img src="./img/audio.svg" class="loader" alt="" />
	{/if}
	{#if artType === 'not found' && showPlaceholder === true}<img src={artSrc} class="notFound" alt="" />{/if}
	{#if artType === 'image'}<img class={klass} src={artSrc} alt="" />{/if}
	{#if artType === 'video'}
		<video class={klass} autoplay loop>
			<track kind="captions" />
			<source src={artSrc} />
		</video>
	{/if}
</art-art>

<style>
	art-art {
		cursor: default;
		grid-column: 1;
		grid-row: 1;
		display: block;

		transform: scale(1);

		transition: transform 300ms cubic-bezier(0.5, 0.5, 0.265, 1.5);
	}

	art-art[data-loaded='true'] {
		transform: scale(1);
	}

	art-art[data-loaded='false'] {
		transform: scale(0);
	}

	art-art > * {
		height: 100%;
	}

	img.loader {
		padding: 5rem;
	}

	img.notFound {
		border-width: 10px;
		border-color: #fff #ccc #ccc #fff;
		border-style: solid;
		padding: 2rem;
	}
</style>
